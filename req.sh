#!/bin/sh
while :; do
  x="curl localhost:8080"
  eval "$x"
  echo
done
