const { BotDriver } = require('botium-core')
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const Mocha = require('mocha')
const { Base } = Mocha.reporters

const logFile = 'chat.log'

describe('Sona Cycle Sales Project', function () {

  this.timeout(1800000)

  let driver
  let container

  before(async function () {

    // Reset log setiap test run
    fs.writeFileSync(logFile, '')

    driver = new BotDriver()

    if (process.env.API_URL) {
      driver.setCapability('SIMPLEREST_URL', process.env.API_URL)
    }
    
    if (process.env.PROJECT_NAME) {
      driver.setCapability('PROJECTNAME', process.env.PROJECT_NAME)
    }

    const bodyTemplate = driver.caps['SIMPLEREST_BODY_TEMPLATE']
    if (bodyTemplate) {
      if (process.env.SESSION_ID) {
        bodyTemplate.sessionId = process.env.SESSION_ID
      }
      if (process.env.PHONE_NUMBER && bodyTemplate.whatsapp) {
        bodyTemplate.whatsapp.phone = process.env.PHONE_NUMBER
      }
      driver.setCapability('SIMPLEREST_BODY_TEMPLATE', bodyTemplate)
    }

    container = await driver.Build()

    await container.Start()
  })

  after(async function () {

    if (container) {
      await container.Stop()
      await container.Clean()
    }
  })

  it('Run All Convos', async function () {

    const convoDir = path.join(__dirname, 'convo')

    const files = fs.readdirSync(convoDir)
      .filter(f => f.endsWith('.convo.txt'))

    if (files.length === 0) {
      throw new Error('No convo files found')
    }

    for (const file of files) {

      console.log(`\n========== ${file} ==========\n`)

      fs.appendFileSync(
        logFile,
        `\n========== ${file} ==========\n\n`
      )

      const content = fs.readFileSync(
        path.join(convoDir, file),
        'utf8'
      )

      /*
       * Parse conversation.
       *
       * Format yang didukung:
       *
       * me: message satu baris
       *
       * me: message multiline
       * baris kedua
       * baris ketiga
       *
       * bot: response
       * bot: response berikutnya
       */

      const lines = content.split(/\r?\n/)

      const messages = []

      let currentSender = null
      let currentMessage = []

      for (const rawLine of lines) {

        const line = rawLine.replace(/\r$/, '')

        // Skip comment
        if (line.trim().startsWith('#')) {
          continue
        }

        // Detect "me:"
        const meMatch = line.match(/^me:\s?(.*)$/i)

        if (meMatch) {

          // Save previous message
          if (
            currentSender &&
            currentMessage.length > 0
          ) {
            messages.push({
              sender: currentSender,
              message: currentMessage.join('\n').trim()
            })
          }

          currentSender = 'me'

          currentMessage = [
            meMatch[1]
          ]

          continue
        }

        // Detect "bot:"
        const botMatch = line.match(/^bot:\s?(.*)$/i)

        if (botMatch) {

          // Save previous message
          if (
            currentSender &&
            currentMessage.length > 0
          ) {
            messages.push({
              sender: currentSender,
              message: currentMessage.join('\n').trim()
            })
          }

          currentSender = 'bot'

          currentMessage = [
            botMatch[1]
          ]

          continue
        }

        /*
         * Jika bukan "me:" atau "bot:",
         * maka dianggap sebagai continuation
         * dari message sebelumnya.
         */
        if (currentSender) {
          currentMessage.push(line)
        }
      }

      // Save last message
      if (
        currentSender &&
        currentMessage.length > 0
      ) {
        messages.push({
          sender: currentSender,
          message: currentMessage.join('\n').trim()
        })
      }

      /*
       * Jalankan hanya message dari "me".
       *
       * Setiap "me:" akan dikirim sebagai
       * satu message ke chatbot.
       */

      for (const msg of messages) {

        if (msg.sender !== 'me') {
          continue
        }

        console.log('\nRara:')
        console.log(msg.message)
        console.log('')

        fs.appendFileSync(
          logFile,
          `Rara:\n${msg.message}\n\n`
        )

        /*
         * Kirim satu message utuh.
         *
         * Newline di dalam msg.message
         * tetap dipertahankan.
         */

        await container.UserSays({
          messageText: msg.message
        })

        const botMsg = await container.WaitBotSays()

        console.log('Rara Official:')
        console.log(botMsg.messageText)
        console.log('')

        fs.appendFileSync(
          logFile,
          `Rara Official:\n${botMsg.messageText}\n\n`
        )
      }
    }
  })
})


/*
 * Custom Mocha Reporter
 */

class ChatReporter extends Base {

  constructor(runner) {

    super(runner)

    runner.on('pass', (test) => {

      console.log(
        '\n==================================='
      )

      console.log(
        `TEST PASSED: ${test.title}`
      )

      console.log(
        '===================================\n'
      )

      const transcript = test.ctx.transcript

      if (
        transcript &&
        transcript.steps
      ) {

        transcript.steps.forEach((step) => {

          if (step.sender === 'me') {

            console.log(
              `Rara: ${step.actual}`
            )
          }

          if (step.sender === 'bot') {

            console.log(
              `Rara Official: ${step.actual}`
            )
          }
        })
      }
    })


    runner.on('fail', (test, err) => {

      console.log(
        '\n==================================='
      )

      console.log(
        `TEST FAILED: ${test.title}`
      )

      console.log(
        '===================================\n'
      )

      console.log(err.message)
    })


    runner.on('end', () => {

      console.log(
        '\nSelesai menjalankan semua test case.\n'
      )
    })
  }
}


module.exports = ChatReporter