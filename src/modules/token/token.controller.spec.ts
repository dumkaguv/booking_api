import { Test, TestingModule } from '@nestjs/testing'

import { TokensController } from './token.controller'

describe('TokensController', () => {
  let controller: TokensController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensController]
    }).compile()

    controller = module.get(TokensController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
