import { Route as rootRoute } from './routes/__root'
import { Route as IndexRoute } from './routes/index'
import { Route as BallottaggioRoute } from './routes/ballottaggio'
import { Route as ClassificaRoute } from './routes/classifica'
import { Route as LiveRoute } from './routes/live'
import { Route as LoginRoute } from './routes/login'
import { Route as RegolamentoRoute } from './routes/regolamento'
import { Route as SquadraRoute } from './routes/squadra'

const indexRoute = IndexRoute.update({
  getParentRoute: () => rootRoute,
})

const ballottaggioRoute = BallottaggioRoute.update({
  getParentRoute: () => rootRoute,
})

const classificaRoute = ClassificaRoute.update({
  getParentRoute: () => rootRoute,
})

const liveRoute = LiveRoute.update({
  getParentRoute: () => rootRoute,
})

const loginRoute = LoginRoute.update({
  getParentRoute: () => rootRoute,
})

const regolamentoRoute = RegolamentoRoute.update({
  getParentRoute: () => rootRoute,
})

const squadraRoute = SquadraRoute.update({
  getParentRoute: () => rootRoute,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  ballottaggioRoute,
  classificaRoute,
  liveRoute,
  loginRoute,
  regolamentoRoute,
  squadraRoute,
])
