#!/bin/bash


rm -rf javascript/wallet/*
rm -rf java/wallet/*
rm -rf typescript/wallet/*
rm -rf go/wallet/*

./network.sh down
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn evtrans -cci initLedger -ccl javascript -ccp ../chaincode/evtrans/javascript/
