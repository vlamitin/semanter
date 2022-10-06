const express = require('express')
const http = require('http')
const path = require('path')
const axios = require('axios')

function start() {
    const httpPort = 3002
    const appServer = express()

    appServer.all('*', (req, res, next) => {
        console.debug(new Date().toISOString(), 'info', req.method, req.path)
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, PATCH',
        })
        next()
    })

    appServer.use(express.static(path.join(__dirname, './static')))

    appServer.get('/api/proxy', (req, res) => {
        console.log('req.query', req.query)
        if (!req.query.url || !req.query.contentType) {
            res.status(400).send("url and contentType query params are needed")
        }

        if (req.query.contentType === "text") {
            axios.request({
                url: req.query.url,
                method: 'GET',
            })
                .then((response) => {
                    if (response.status !== 200) {
                        console.error("proxy failed, response.status: %d", response.status)
                        res.status(500).send("error when proxy")
                    }

                    res.status(200).send(response.data)
                })
                .catch(e => {
                    console.error("proxy failed, error: ", e)
                    res.status(500).send("error when proxy")
                })
        }
    })

    appServer.use((err, req, res, next) => {
        console.error(new Date().toISOString(), 'error', err)
        res.status(500).send({error: err.message})
    })

    return new Promise(resolve => {
        http.createServer(appServer).listen(httpPort, () => {
            console.debug(new Date().toISOString(), 'info', 'semanter is running on port:', httpPort)
            resolve()
        })
    })
}

start()
