import { Prisma, RolesEnum } from '@prisma/client'

import { prisma } from '../prisma-client'

type Role = Prisma.RoleCreateInput

export const createRoles = () => {
  const roles: Role[] = [{ code: RolesEnum.ADMIN }, { code: RolesEnum.USER }]

  return prisma.$transaction(
    roles.map((role) => prisma.role.create({ data: role }))
  )
}
