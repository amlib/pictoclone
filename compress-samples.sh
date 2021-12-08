#!/bin/sh
(
    cd samples
    zip -X9 ../samples.zip *.mp3 *.wav *.opus
    zip -X9 ../samples-safari.zip *.mp3 *.wav *.caf
)
