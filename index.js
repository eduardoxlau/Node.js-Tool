const { getProjectsAndTasks } = require('./lib/githubApi')

const regExp = process.argv.slice(2)[0]

const getPrint = async () => {
  const projects = await getProjectsAndTasks(regExp)
  projects.forEach((project) => {
    console.log(project.name)
    console.log(project.body)
    if (project.tasks)
      project.tasks.forEach((task) => {
        console.log(`|---${task}`)
      })
  })
}

getPrint()
