import { PartialType } from '@nestjs/swagger'

import { CreateListingUnitDto } from './create-listing-unit.dto'

export class UpdateListingUnitDto extends PartialType(CreateListingUnitDto) {}
