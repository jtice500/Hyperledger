#!/bin/bash

for i in {1..100..1}
do
  
    first=$(sed "$i!d" info.txt | cut -d ' ' -f 1)
    second=$(sed "$i!d" info.txt | cut -d ' ' -f 2)
    third=$(sed "$i!d" info.txt | cut -d ' ' -f 3)

    start=$(date +%s)
    node createTrans.js "$first" "$second" "$third"
    end=$(date +%s)

    seconds=$(echo "$end - $start" | bc)
    echo "$seconds" >> timer_results.txt
done