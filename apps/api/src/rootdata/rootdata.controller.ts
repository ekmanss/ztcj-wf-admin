import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  BulkBinaryStatusDto,
  BulkPersonStatusDto,
  BulkProjectStatusDto,
  BulkRootdataIdsDto,
  BulkRootdataStringIdsDto,
  FundingRoundsQueryDto,
  ListRootdataQueryDto,
  RootdataOptionQueryDto,
  UpsertFundingRoundDto,
  UpsertJobChangeDto,
  UpsertOrganizationDto,
  UpsertPersonDto,
  UpsertProjectContractDto,
  UpsertProjectDto,
  UpsertProjectEventDto,
  UpsertProjectReportDto,
  UpsertTeamMemberDto,
  type RootdataEntityType,
} from './rootdata.dto'
import { RootdataService } from './rootdata.service'

@Controller('rootdata')
export class RootdataController {
  constructor(private readonly rootdataService: RootdataService) {}

  @Get('projects')
  listProjects(@Query() query: ListRootdataQueryDto) {
    return this.rootdataService.listProjects(query)
  }

  @Post('projects')
  createProject(@Body() dto: UpsertProjectDto) {
    return this.rootdataService.createProject(dto)
  }

  @Patch('projects/bulk/status')
  updateProjectsStatus(@Body() dto: BulkProjectStatusDto) {
    return this.rootdataService.updateProjectsStatus(
      dto.ids,
      dto.field,
      dto.value
    )
  }

  @Delete('projects/bulk')
  deleteProjects(@Body() dto: BulkRootdataIdsDto) {
    return this.rootdataService.deleteProjects(dto.ids)
  }

  @Get('projects/:id')
  getProject(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.getProject(id)
  }

  @Patch('projects/:id')
  updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertProjectDto
  ) {
    return this.rootdataService.updateProject(id, dto)
  }

  @Delete('projects/:id')
  deleteProject(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.deleteProject(id)
  }

  @Get('projects/:id/events')
  listProjectEvents(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.listProjectEvents(id)
  }

  @Post('projects/:id/events')
  createProjectEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertProjectEventDto
  ) {
    return this.rootdataService.upsertProjectEvent(id, undefined, dto)
  }

  @Patch('projects/:id/events/:index')
  updateProjectEvent(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number,
    @Body() dto: UpsertProjectEventDto
  ) {
    return this.rootdataService.upsertProjectEvent(id, index, dto)
  }

  @Delete('projects/:id/events/:index')
  deleteProjectEvent(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number
  ) {
    return this.rootdataService.deleteProjectEvent(id, index)
  }

  @Get('projects/:id/reports')
  listProjectReports(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.listProjectReports(id)
  }

  @Post('projects/:id/reports')
  createProjectReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertProjectReportDto
  ) {
    return this.rootdataService.upsertProjectReport(id, undefined, dto)
  }

  @Patch('projects/:id/reports/:index')
  updateProjectReport(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number,
    @Body() dto: UpsertProjectReportDto
  ) {
    return this.rootdataService.upsertProjectReport(id, index, dto)
  }

  @Delete('projects/:id/reports/:index')
  deleteProjectReport(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number
  ) {
    return this.rootdataService.deleteProjectReport(id, index)
  }

  @Get('projects/:id/contracts')
  listProjectContracts(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.listProjectContracts(id)
  }

  @Post('projects/:id/contracts')
  createProjectContract(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertProjectContractDto
  ) {
    return this.rootdataService.upsertProjectContract(id, undefined, dto)
  }

  @Patch('projects/:id/contracts/:index')
  updateProjectContract(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number,
    @Body() dto: UpsertProjectContractDto
  ) {
    return this.rootdataService.upsertProjectContract(id, index, dto)
  }

  @Delete('projects/:id/contracts/:index')
  deleteProjectContract(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number
  ) {
    return this.rootdataService.deleteProjectContract(id, index)
  }

  @Get('projects/:id/members')
  listProjectMembers(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.listTeamMembers(1, id)
  }

  @Post('projects/:id/members')
  createProjectMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertTeamMemberDto
  ) {
    return this.rootdataService.upsertTeamMember(1, id, undefined, dto)
  }

  @Patch('projects/:id/members/:personId')
  updateProjectMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('personId') personId: string,
    @Body() dto: UpsertTeamMemberDto
  ) {
    return this.rootdataService.upsertTeamMember(1, id, personId, dto)
  }

  @Delete('projects/:id/members/:personId')
  deleteProjectMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('personId') personId: string
  ) {
    return this.rootdataService.deleteTeamMember(1, id, personId)
  }

  @Get('projects/:id/funding-rounds')
  listProjectFundingRounds(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.listProjectFundingRounds(id)
  }

  @Get('persons')
  listPersons(@Query() query: ListRootdataQueryDto) {
    return this.rootdataService.listPersons(query)
  }

  @Post('persons')
  createPerson(@Body() dto: UpsertPersonDto) {
    return this.rootdataService.createPerson(dto)
  }

  @Patch('persons/bulk/status')
  updatePersonsStatus(@Body() dto: BulkPersonStatusDto) {
    return this.rootdataService.updatePersonsStatus(dto.ids, dto.status)
  }

  @Delete('persons/bulk')
  deletePersons(@Body() dto: BulkRootdataStringIdsDto) {
    return this.rootdataService.deletePersons(dto.ids)
  }

  @Get('persons/:id')
  getPerson(@Param('id') id: string) {
    return this.rootdataService.getPerson(id)
  }

  @Patch('persons/:id')
  updatePerson(@Param('id') id: string, @Body() dto: UpsertPersonDto) {
    return this.rootdataService.updatePerson(id, dto)
  }

  @Delete('persons/:id')
  deletePerson(@Param('id') id: string) {
    return this.rootdataService.deletePerson(id)
  }

  @Get('persons/:id/job-changes')
  listPersonJobChanges(@Param('id') id: string) {
    return this.rootdataService.listPersonJobChanges(id)
  }

  @Post('persons/:id/job-changes')
  createPersonJobChange(
    @Param('id') id: string,
    @Body() dto: UpsertJobChangeDto
  ) {
    return this.rootdataService.upsertPersonJobChange(id, undefined, dto)
  }

  @Patch('persons/:id/job-changes/:jobChangeId')
  updatePersonJobChange(
    @Param('id') id: string,
    @Param('jobChangeId', ParseIntPipe) jobChangeId: number,
    @Body() dto: UpsertJobChangeDto
  ) {
    return this.rootdataService.upsertPersonJobChange(id, jobChangeId, dto)
  }

  @Delete('persons/:id/job-changes/:jobChangeId')
  deletePersonJobChange(
    @Param('id') id: string,
    @Param('jobChangeId', ParseIntPipe) jobChangeId: number
  ) {
    return this.rootdataService.deletePersonJobChange(id, jobChangeId)
  }

  @Get('organizations')
  listOrganizations(@Query() query: ListRootdataQueryDto) {
    return this.rootdataService.listOrganizations(query)
  }

  @Post('organizations')
  createOrganization(@Body() dto: UpsertOrganizationDto) {
    return this.rootdataService.createOrganization(dto)
  }

  @Patch('organizations/bulk/status')
  updateOrganizationsStatus(@Body() dto: BulkBinaryStatusDto) {
    return this.rootdataService.updateOrganizationsStatus(dto.ids, dto.status)
  }

  @Delete('organizations/bulk')
  deleteOrganizations(@Body() dto: BulkRootdataIdsDto) {
    return this.rootdataService.deleteOrganizations(dto.ids)
  }

  @Get('organizations/:id')
  getOrganization(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.getOrganization(id)
  }

  @Patch('organizations/:id')
  updateOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertOrganizationDto
  ) {
    return this.rootdataService.updateOrganization(id, dto)
  }

  @Delete('organizations/:id')
  deleteOrganization(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.deleteOrganization(id)
  }

  @Get('organizations/:id/members')
  listOrganizationMembers(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.listTeamMembers(2, id)
  }

  @Post('organizations/:id/members')
  createOrganizationMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertTeamMemberDto
  ) {
    return this.rootdataService.upsertTeamMember(2, id, undefined, dto)
  }

  @Patch('organizations/:id/members/:personId')
  updateOrganizationMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('personId') personId: string,
    @Body() dto: UpsertTeamMemberDto
  ) {
    return this.rootdataService.upsertTeamMember(2, id, personId, dto)
  }

  @Delete('organizations/:id/members/:personId')
  deleteOrganizationMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('personId') personId: string
  ) {
    return this.rootdataService.deleteTeamMember(2, id, personId)
  }

  @Get('funding-rounds')
  listFundingRounds(@Query() query: FundingRoundsQueryDto) {
    return this.rootdataService.listFundingRounds(query)
  }

  @Post('funding-rounds')
  createFundingRound(@Body() dto: UpsertFundingRoundDto) {
    return this.rootdataService.createFundingRound(dto)
  }

  @Patch('funding-rounds/:id')
  updateFundingRound(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertFundingRoundDto
  ) {
    return this.rootdataService.updateFundingRound(id, dto)
  }

  @Delete('funding-rounds/:id')
  deleteFundingRound(@Param('id', ParseIntPipe) id: number) {
    return this.rootdataService.deleteFundingRound(id)
  }

  @Get('options/tags')
  listTags(@Query() query: RootdataOptionQueryDto) {
    return this.rootdataService.listTags(query)
  }

  @Get('options/ecosystems')
  listEcosystems(@Query() query: RootdataOptionQueryDto) {
    return this.rootdataService.listEcosystems(query)
  }

  @Get('options/platforms')
  listPlatforms(@Query() query: RootdataOptionQueryDto) {
    return this.rootdataService.listPlatforms(query)
  }

  @Get('options/exchanges')
  listExchanges(@Query() query: RootdataOptionQueryDto) {
    return this.rootdataService.listExchanges(query)
  }

  @Get('options/coins')
  listCoins(@Query() query: RootdataOptionQueryDto) {
    return this.rootdataService.listCoins(query)
  }

  @Get('options/entities/:type')
  listEntityOptions(
    @Param('type', ParseIntPipe) type: RootdataEntityType,
    @Query() query: RootdataOptionQueryDto
  ) {
    return this.rootdataService.listEntityOptions(type, query)
  }

  @Get('options/funding-rounds')
  listFundingRoundNames() {
    return this.rootdataService.listFundingRoundNames()
  }
}
