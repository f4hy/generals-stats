#!/bin/bash

OUT_DIR="./src"
TS_OUT_DIR="./src"
IN_DIR="./proto"
PROTOC="$(npm bin)/grpc_tools_node_protoc"
PROTOC_GEN_TS_PATH="$(npm bin)/protoc-gen-ts"
PROTOC_GEN_GRPC_PATH="$(npm bin)/grpc_tools_node_protoc_plugin"


protoc \
    -I=${PWD} \
    --go_out=backend/ --go-grpc_out=backend/\
    proto/match.proto


protoc \
    -I="./" \
    --plugin=./node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_out="$OUT_DIR" \
    --ts_proto_opt=esModuleInterop=true \
    "$IN_DIR"/*.proto


    # --plugin=protoc-gen-ts=$PROTOC_GEN_TS_PATH \
    # --js_out=import_style=commonjs:$OUT_DIR \
    # --ts_out="$OUT_DIR" \


# ./node_modules/.bin/proto-loader-gen-types --longs=String --enums=String --defaults --oneofs --grpcLib=@grpc/grpc-js --outDir=src/ proto/match.proto



# --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=src/ \
    # --ts_proto_opt=esModuleInterop=true\
    # --ts_proto_opt=outputServices=grpc-js \
