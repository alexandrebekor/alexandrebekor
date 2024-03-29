import { RepositoriesProps, github } from "../../libs/github";
import { RepositoriesGateway } from "../repositories.gateway";
import { decodeBase64UTF8 } from "../../app/utils/format";

export class GithubRepositoriesGateway implements RepositoriesGateway {
  async getCover(text: string) {
    const regex = /::cover:\s*(.*?)(?:\n|$)/s
    const expression = text.match(regex)

    if(expression) {
      const url = expression[1]
      return url
    }

    return null
  }

  async find(data?: { size: number }): Promise<RepositoriesProps> {
    const response = await github.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'created'
    })

    const repositories = response.data.filter(repository => {
      return repository.topics && repository.topics?.length > 0
    })

    return data?.size ? repositories.slice(0, data.size) : repositories
  }

  async getReadme(repository: string): Promise<string | null> {
    try {
      const readmeEncoded = await github.rest.repos.getReadme({
        owner: 'alexandrebekor',
        repo: repository,
      })
  
      return decodeBase64UTF8(readmeEncoded.data.content)
    } catch (error) {
      return null
    }
  }

  async findWithCover(data?: { size: number }) {
    const repositories = data ? await this.find({
      size: data?.size
    }) : await this.find()

    const repositoriesWithReadme = repositories.map(repository => {
        return {
          ...repository,
          cover: `/repositories/${repository.name}.png`
        }
      })
    
    return repositoriesWithReadme
  }
}