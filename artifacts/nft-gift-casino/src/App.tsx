import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlayerProvider } from "@/components/player-provider";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import HomePage from "@/pages/home";
import SlotPage from "@/pages/spin";
import GiftsPage from "@/pages/gifts";
import LeaderboardPage from "@/pages/leaderboard";
import StatsPage from "@/pages/stats";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/play" component={SlotPage} />
        <Route path="/gifts" component={GiftsPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/stats" component={StatsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </PlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
