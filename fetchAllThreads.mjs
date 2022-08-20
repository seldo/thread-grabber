import process from 'node:process'
import fs from 'node:fs/promises'
import { parse } from 'csv-parse/sync';

const LIST_OF_THREADS = process.argv[2]

if(!LIST_OF_THREADS) {
    console.error("No CSV of threads provided")
    process.exit(-1)
}

let listData = await fs.readFile(LIST_OF_THREADS,{encoding:"utf-8"})
const records = parse(listData, {
    columns: true,
    skip_empty_lines: true
})

console.log(records)
