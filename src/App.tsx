import React, { useEffect, useState } from 'react';
import {
  advanceToNextSol,
  createInitialState,
  performAction,
  resolveEventChoice,
  startSolOperations,
  triggerDailyEvent,
} from './game/engine';
import { ActionId, GameState, MissionReport, ScreenId } from './game/types';
import {
  loadGameState,
  loadMissionReports,
  loadSoundMuted,
  saveGameState,
  saveMissionReport,
  saveSoundMuted,
} from './utils/storage';
import { HeaderNav } from './components/HeaderNav';
import { LandingScreen } from './components/LandingScreen';
import { TutorialScreen } from './components/TutorialScreen';
import { MissionControlScreen } from './components/MissionControlScreen';
import { SpaceWeatherScreen } from './components/SpaceWeatherScreen';
import { MissionHistoryScreen } from './components/MissionHistoryScreen';
import { MissionResultsScreen } from './components/MissionResultsScreen';
import { ScienceSourcesFooter } from './components/ScienceSourcesFooter';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenId>('landing');
  const [gameState, setGameState] = useState<GameState | null>(() => loadGameState());
  const [pastReports, setPastReports] = useState<MissionReport[]>(() => loadMissionReports());
  const [soundMuted, setSoundMuted] = useState<boolean>(() => loadSoundMuted());

  useEffect(() => {
    if (!gameState) return;
    saveGameState(gameState);
    if (gameState.report) {
      saveMissionReport(gameState.report);
      setPastReports(loadMissionReports());
    }
  }, [gameState]);

  const handleToggleSound = () => {
    setSoundMuted((prev) => {
      const next = !prev;
      saveSoundMuted(next);
      return next;
    });
  };

  const handleStartNewMission = (customSeed?: string) => {
    const fresh = createInitialState(customSeed);
    setGameState(fresh);
    setScreen('mission');
  };

  const handleResumeMission = () => {
    if (!gameState) {
      handleStartNewMission();
      return;
    }
    setScreen('mission');
  };

  const handleNavigate = (target: ScreenId) => {
    if (target === 'mission' && !gameState) {
      handleStartNewMission();
      return;
    }
    setScreen(target);
  };

  const updateGame = (updater: (prev: GameState) => GameState) => {
    setGameState((prev) => (prev ? updater(prev) : prev));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b17] text-slate-50">
      <HeaderNav
        screen={screen}
        onNavigate={handleNavigate}
        gameState={gameState}
        onNewMission={() => handleStartNewMission()}
      />

      {screen === 'landing' && (
        <LandingScreen
          existingGame={gameState}
          onStartNewMission={handleStartNewMission}
          onResumeMission={handleResumeMission}
          onNavigate={handleNavigate}
        />
      )}

      {screen === 'tutorial' && (
        <TutorialScreen onBeginMission={() => handleStartNewMission()} />
      )}

      {screen === 'mission' && gameState && (
        <MissionControlScreen
          state={gameState}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
          onStartOperations={() => updateGame(startSolOperations)}
          onPerformAction={(actionId: ActionId) =>
            updateGame((s) => performAction(s, actionId))
          }
          onTriggerEvent={() => updateGame(triggerDailyEvent)}
          onResolveEventChoice={(choiceId: string) =>
            updateGame((s) => resolveEventChoice(s, choiceId))
          }
          onAdvanceSol={() => updateGame(advanceToNextSol)}
          onNavigate={handleNavigate}
        />
      )}

      {screen === 'weather' && <SpaceWeatherScreen gameState={gameState} />}

      {screen === 'history' && (
        <MissionHistoryScreen gameState={gameState} pastReports={pastReports} />
      )}

      {screen === 'results' && gameState?.report && (
        <MissionResultsScreen
          report={gameState.report}
          onReplayNewSeed={() => handleStartNewMission()}
          onNavigate={handleNavigate}
        />
      )}

      <ScienceSourcesFooter />
    </div>
  );
};

export default App;
