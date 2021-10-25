# This script will process a directory of exported data files
# into a sqlite database on the filesystem.
# It requires sqlite-utils to be installed.

if ! command -v sqlite-utils &> /dev/null
then
    echo "sqlite-utils could not be found."
    exit
fi



if [ $# -lt 2 ]
  then
    echo "
insufficient arguments.
the command must be shaped like this:
bash to-sqlite.sh microfiche.db path/to/datafiles
    "
    exit
fi

cleanup() {
    # kill all processes whose parent is this process
    pkill -P $$
}

for sig in INT QUIT HUP TERM; do
  trap "
    cleanup
    trap - $sig EXIT
    kill -s $sig "'"$$"' "$sig"
done
trap cleanup EXIT

rm $1
for file in $2/pages-*;  do
    echo "processing page visits $file"
    # there will be duplicate pageIds that arise out of 
    # importing + clearing data, and the system inserting a new
    # entry into indexeddb. So --replace will throw out the older
    # one in favor of the new one. This usually only happens when
    # you have cleared the local storage from the options page.
    sqlite-utils insert $1 pages "$file" --pk=pageId --replace
done

for file in $2/events-*; do
    echo "processing events $file"
    sqlite-utils insert $1 events "$file"
done

for file in $2/articles-*; do
    echo "processing articles $file"
    sqlite-utils insert $1 articles "$file"
done

echo "creating indices ... "

sqlite-utils create-index $1 pages pageId
sqlite-utils create-index $1 events pageId
sqlite-utils create-index $1 articles pageId

echo "creating attention duration view"

sqlite-utils create-view $1 attentionDuration "
SELECT
    pageId,
    nextTimestamp - timestamp AS durationMS,
    timestamp as startTime
    --datetime(timestamp / 1000, 'unixepoch') as startTime
    FROM
    (SELECT 
    timestamp,
    eventType,
    pageId,
    LEAD(timestamp, 1) OVER (ORDER BY pageId, timestamp) AS nextTimestamp,
    LEAD(eventType, 1) OVER (ORDER BY pageId, timestamp) AS nextEvent,
    LEAD(pageId, 1) OVER (ORDER BY pageId, timestamp) AS nextPageId
        FROM
        (SELECT *
        FROM events
        ORDER BY pageId, timestamp
        )
)
WHERE pageId = nextPageId
AND (
    (eventType = 'attention-start' and nextEvent = 'attention-stop') OR
    (eventType = 'attention-start' and nextEvent = 'page-visit-stop')
);"