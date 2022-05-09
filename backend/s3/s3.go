package s3

import (
	"bytes"
	"fmt"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
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
	log.Infof("Adding data to S3 file (%s)", filePath)
	s, err := session.NewSession(&aws.Config{Region: aws.String(S3_REGION)})
	if log.V(2) {
		log.Infof("Writing %s : %s \n", filePath, string(databuffer))
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
		return err
	}

	log.Infof("Successfully added data to S3 file (%s)", filePath)
	return nil
}

func GetS3Data(filePath string) ([]byte, error) {
	log.Infof("Retrieving data from S3 file (%s)", filePath)
	s, err := session.NewSession(&aws.Config{Region: aws.String(S3_REGION)})
	if err != nil {
		return nil, err
	}
	rawObject, err := s3.New(s).GetObject(&s3.GetObjectInput{
		Bucket: aws.String(S3_BUCKET),
		Key:    aws.String(filePath),
	})
	if err != nil {
		return nil, err
	}
	if log.V(2) {
		log.Infof("Got Obj: %v", rawObject)
		log.Infof("Body: %s", rawObject.Body)
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(rawObject.Body)
	if err != nil {
		return nil, err
	}
	bytes := buf.Bytes()
	if log.V(2) {
		fmt.Printf("Fetched %s : %s \n", filePath, bytes)
	}
	log.Infof("Successfully retrieved data from S3 file (%s)", filePath)
	return bytes, nil
}

// Gets an s3 presigned url from the bucket so that it can be accessed
// by the front end
func GetPresignedUrl(path string) (string, error) {
	s, err := session.NewSession(&aws.Config{Region: aws.String(S3_REGION)})
	log.Infof("Getting presigned url for ", path)
	req, _ := s3.New(s).GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(S3_BUCKET),
		Key:    aws.String(path),
	})
	urlStr, err := req.Presign(15 * time.Minute)

	if err != nil {
		log.Infof("Failed to sign request", err)
		return urlStr, err
	}
	log.Infof("The URL is", urlStr)
	return urlStr, nil
}

func List(path string) ([]string, error) {
	s, err := session.NewSession(&aws.Config{Region: aws.String(S3_REGION)})
	svc := s3.New(s)
	input := &s3.ListObjectsV2Input{
		Bucket:  aws.String(S3_BUCKET),
		Prefix:  aws.String(path),
		MaxKeys: aws.Int64(1000),
	}
	results, err := svc.ListObjectsV2(input)
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case s3.ErrCodeNoSuchBucket:
				fmt.Println(s3.ErrCodeNoSuchBucket, aerr.Error())
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}
		return nil, err
	}
	var asStrings []string
	for _, listing := range results.Contents {
		asStrings = append(asStrings, *listing.Key)
	}
	return asStrings, nil
}
