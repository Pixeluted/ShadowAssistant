module.exports = {
    callback: (message, client, ...args) => {
        message.channel.send('Pong')
    }
}