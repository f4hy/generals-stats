#!/bin/bash

aws s3 sync --delete parsed-matches/ s3://generals-stats/parsed-matches/
aws s3 sync --delete match-details/ s3://generals-stats/match-details/
