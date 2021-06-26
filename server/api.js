#!/usr/bin/env node

const express = require('express')
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const winston = require('winston')


const consoleTransport = new winston.transports.Console()
const {combine, timestamp, label, prettyPrint, simple} = winston.format

const myFormat = prettyPrint(({level, message, label, timestamp}) => {
    return `${timestamp} [${label}] ${level}: ${message}`
})

const argv = yargs(hideBin(process.argv)).argv

const port = argv.p || argv.port || 3000
const appName = argv.n || argv.name || "anonymous"

const myWinstonOptions = {
    format: combine(
        label({label: appName}),
        timestamp(),
        myFormat
    ),
    transports: [consoleTransport]
}
const logger = new winston.createLogger(myWinstonOptions)

function l(req, res, err, show) {
    const start = process.hrtime()
    const now = new Date().toISOString()
    // console.log(`${req.method} ${req.originalUrl} [STARTED]`)
    const {hostname, url, ip, method, originalUrl, protocol} = req
    const logs = {
        method,
        hostname,
        url,
        originalUrl,
        ip,
        protocol,
        startDate: now,
        err,
        status: res.statusCode
    }
    res.on('finish', () => {
        const durationInMilliseconds = getDurationInMilliseconds(start)
        // .log(`${req.method} ${req.originalUrl} [FINISHED] ${durationInMilliseconds.toLocaleString()} ms`)
        logs.finished = `${durationInMilliseconds.toLocaleString()} ms`
        // logs.finishedDate = new Date().toISOString()
        logs.status = res.statusCode
    })
    res.on('close', () => {
        const durationInMilliseconds = getDurationInMilliseconds(start)
        // console.log(`${req.method} ${req.originalUrl} [CLOSED] ${durationInMilliseconds.toLocaleString()} ms`)
        logs.closed = `${durationInMilliseconds.toLocaleString()} ms`
        logs.closedDate = new Date().toISOString()
        logs.status = res.statusCode
        if (logs.status !== 200) {
            logs.err = res.status
            return logger.error(logs)
        }
        show(logs)
    })
}

function logRequest(req, res, next) {
    l(req, res, undefined, logger.info)
    next()
}

function logError(err, req, res, next) {
    l(req, res, err, logger.error)
    next()
}

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}


const app = express()

app.use(logError)

app.use(logRequest)

app.get('/', function (req, res) {
    // if (3033 === parseInt(port)) {
    //     setTimeout(() => {
    //         res.json({ok: port})
    //     }, 3000)
    //     return
    // }
    res.json({ok: port})
})

app.listen(port).on("listening", () => {
    console.log(`listening at ${port}`)
})