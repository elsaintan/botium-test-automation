const Mocha = require('mocha')
const { Base } = Mocha.reporters


class ChatReporter extends Base {
  constructor(runner) {
    super(runner)


    runner.on('pass', (test) => {
      console.log('\n===================================')
      console.log(`TEST PASSED: ${test.title}`)
      console.log('===================================\n')


      const transcript = test.ctx.transcript


      if (transcript && transcript.steps) {
        transcript.steps.forEach((step) => {


          if (step.sender === 'me') {
            console.log(`Rara: ${step.actual}`)
          }


          if (step.sender === 'bot') {
            console.log(`Rara Official: ${step.actual}`)
          }
        })
      }
    })


    runner.on('fail', (test, err) => {
      console.log('\n===================================')
      console.log(`TEST FAILED: ${test.title}`)
      console.log('===================================\n')


      console.log(err.message)
    })


    runner.on('end', () => {
      console.log('\nSelesai menjalankan semua test case.\n')
    })
  }
}


module.exports = ChatReporter
