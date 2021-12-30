const fs = require('fs')

const getFiles = (dir, suffix) => {
    const files = fs.readdirSync(dir, {
        withFileTypes: true,
    })

    let commandFiles = []
    console.log(dir)

    for (const file of files){
        if (file.isDirectory()){
            commandFiles = [
                ...commandFiles,
                ...getFiles(`${dir}/${file.name}`, suffix)
            ]

            console.log('found dir '+ file.name)
        } else if (file.name.endsWith(suffix)) {
            console.log('found file '+ file.name)
            commandFiles.push(`${dir}/${file.name}`)
        }
    }

    return commandFiles
}

module.exports = getFiles  