const { Octokit } = require('@octokit/core')
const { token } = require('./env-config')

const octokit = new Octokit({
  auth: token,
})

const API_PROJECTS = '/orgs/moove-it/projects'
const API_COLUMNS = '/projects/{id}/columns'
const API_CARDS = '/projects/columns/{id}/cards'

const getApi = (api, id) =>
  octokit
    .request(api, {
      id,
      mediaType: {
        previews: ['inertia'],
      },
    })
    .then((res) => res.data)

const getTask = (cards = []) =>
  cards.reduce((acc, curr) => {
    const notes = curr.note.split('\r\n')

    const task = notes.reduce((accNotes, currNote) => {
      if (currNote.includes('- [')) accNotes.push(currNote)
      return accNotes
    }, [])
    acc = acc.concat(task)
    return acc
  }, [])

const getProjectsAndTasks = async (regExp = '^[A-Za-z]') => {
  const projects = await getApi(API_PROJECTS)
  let columns = []
  let cards = []

  return projects.reduce(async (acc, currProject) => {
    if (
      new RegExp(regExp).test(currProject.name) ||
      new RegExp(regExp).test(currProject.body)
    ) {
      const { id } = currProject
      columns = columns.concat(await getApi(API_COLUMNS, id))

      for (const column of columns) {
        const { id } = column
        cards = cards.concat(await getApi(API_CARDS, id))
        currProject.tasks = getTask(cards)
      }
      acc.push(currProject)
    }
    return acc
  }, [])
}

module.exports = { getProjectsAndTasks }
