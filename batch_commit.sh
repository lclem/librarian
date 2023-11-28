#!/bin/bash

# Set the desired commit message
COMMIT_MESSAGE="Batch second commit"

# Specify the number of files to process in each batch
BATCH_SIZE=10

# Set the maximum file size in bytes (99 MB)
MAX_FILE_SIZE=$((99 * 1024 * 1024))

# Get the list of modified files
MODIFIED_FILES=$(git status --porcelain --untracked-files) # | awk '{print $2}')

# Count the total number of modified files
TOTAL_FILES=$(echo "$MODIFIED_FILES" | wc -l)
echo "TOTAL $TOTAL_FILES"

#Set the field separator to new line
IFS=$'\n'

# set -o xtrace

(( i = 1 ))
(( n = 0 ))

for LINE in ${MODIFIED_FILES}; do
    # IFS=$' '
    FILE=${LINE:3}
    FILE=$(echo ${FILE} | tr -d \")
    echo FILE ${FILE}

    git add ./${FILE}

    if (( i >= BATCH_SIZE )); then
      git pull
      git commit -m "${COMMIT_MESSAGE} #${n}"
      git push origin
      #git reset HEAD
      (( i = 1 ))
      (( n = n + 1 ))
    fi

    (( i = i + 1 ))
done