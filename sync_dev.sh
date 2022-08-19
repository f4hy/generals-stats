#!/bin/bash
set -x

aws s3 sync --delete parsed-matches/ s3://generals-stats/dev/parsed-matches/
aws s3 sync --delete match-details/ s3://generals-stats/dev/match-details/
