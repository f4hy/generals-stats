package s3

import (
	"bytes"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	log "github.com/golang/glog"
	"net/http"
	"time"
)

const (
	S3_REGION = "us-east-2"
	S3_BUCKET = "generals-stats"
)

func AddDataToS3(filePath string, databuffer []byte) error {
	log.V(1).Infof("Adding data to S3 file (%s)", filePath)
	s, err := session.NewSession(&aws.Config{Region: aws.String(S3_REGION)})
	if err != nil {
		log.Errorf("Failed to create s3 session %s", err)
		return err
	}

	_, err = s3.New(s).PutObject(&s3.PutObjectInput{
		Bucket:               aws.String(S3_BUCKET),
		Key:                  aws.String(filePath),
		ACL:                  aws.String("private"),
		Body:                 bytes.NewReader(databuffer),
		ContentLength:        aws.Int64(int64(len(databuffer))),
		ContentType:          aws.String(http.DetectContentType(databuffer)),
		ContentDisposition:   aws.String("attachment"),
		ServerSideEncryption: aws.String("AES256"),
	})
	if err != nil {
		log.Errorf("Failed to data to S3 file (%s): %s", filePath, err)
		return err
	}

	log.V(1).Infof("Successfully added data to S3 file (%s)", filePath)
	return nil
}

func GetS3Data(filePath string) ([]byte, error) {
	log.V(1).Infof("Retrieving data from S3 file (%s)", filePath)
	s, err := session.NewSession(&aws.Config{Region: aws.String(S3_REGION)})
	if err != nil {
		return nil, err
	}
	rawObject, err := s3.New(s).GetObject(&s3.GetObjectInput{
		Bucket: aws.String(S3_BUCKET),
		Key:    aws.String(filePath),
	})
	if err != nil {
		log.Errorf("Error getting object %v", filePath)
		return nil, err
	}
	log.V(2).Infof("Got Obj: %v", rawObject)
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(rawObject.Body)
	if err != nil {
		return nil, err
	}
	bytes := buf.Bytes()
	log.V(1).Infof("Successfully retrieved data from S3 file (%s)", filePath)
	return bytes, nil
}

// Gets an s3 presigned url from the bucket so that it can be accessed
// by the front end
func GetPresignedUrl(path string) (string, error) {
	s, err := session.NewSession(&aws.Config{Region: aws.String(S3_REGION)})
	log.V(1).Infof("Getting presigned url for %s", path)
	req, _ := s3.New(s).GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(S3_BUCKET),
		Key:    aws.String(path),
	})
	urlStr, err := req.Presign(15 * time.Minute)

	if err != nil {
		log.Errorf("Failed to sign request %s", err)
		return urlStr, err
	}
	log.V(1).Infof("The URL is %s", urlStr)
	return urlStr, nil
}

func List(path string) ([]string, error) {
	s, err := session.NewSession(&aws.Config{Region: aws.String(S3_REGION)})
	if err != nil {
		log.Fatal("Failed to fetch s3")
	}
	svc := s3.New(s)
	var asStrings []string
	var continuationToken *string
	for {
		resp, err := svc.ListObjectsV2(&s3.ListObjectsV2Input{
			Bucket:            aws.String(S3_BUCKET),
			Prefix:            aws.String(path),
			ContinuationToken: continuationToken,
		})
		if err != nil {
			log.Fatal("Failed to fetch s3")
		}
		for _, listing := range resp.Contents {
			asStrings = append(asStrings, *listing.Key)
		}
		if !aws.BoolValue(resp.IsTruncated) {
			break
		}
		continuationToken = resp.NextContinuationToken
	}
	return asStrings, nil
}
