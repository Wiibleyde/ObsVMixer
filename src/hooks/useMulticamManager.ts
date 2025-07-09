import { useState, useCallback } from 'react';
import { OBSService } from '../services/obsService';
import { type MulticamData } from './useOBSConnection';

interface UseMulticamManagerProps {
  obsService: OBSService;
  isConnected: boolean;
}

export function useMulticamManager({ obsService, isConnected }: UseMulticamManagerProps) {
  const [multicams, setMulticams] = useState<MulticamData[]>([]);
  const [cameraScenes, setCameraScenes] = useState<string[]>([]);
  const [isLoadingInterface, setIsLoadingInterface] = useState(false);
  const [isApplyingCamera, setIsApplyingCamera] = useState(false);

  const updateCurrentSelections = useCallback(async (multicamNames?: string[], forceUpdate = false) => {
    console.log("updateCurrentSelections called, isApplyingCamera:", isApplyingCamera, "isConnected:", isConnected, "forceUpdate:", forceUpdate);
    if (isApplyingCamera || (!isConnected && !forceUpdate)) {
      console.log("Skipping updateCurrentSelections");
      return;
    }

    const names = multicamNames || multicams.map(m => m.name);
    console.log("Names to update:", names);
    if (names.length === 0) {
      console.log("No names to update");
      return;
    }

    try {
      console.log("Getting current cameras for multicams...");
      const updatedMulticams = await Promise.all(
        names.map(async (name) => {
          console.log(`Getting current camera for ${name}...`);
          const currentCamera = await obsService.getCurrentCamera(name);
          console.log(`Current camera for ${name}:`, currentCamera);
          return {
            name,
            currentCamera,
            isLoading: false
          };
        })
      );

      console.log("Updated multicam data:", updatedMulticams);

      setMulticams(prev => {
        console.log("Previous multicams:", prev);
        const newMulticams = [...prev];
        updatedMulticams.forEach(updated => {
          const index = newMulticams.findIndex(m => m.name === updated.name);
          if (index >= 0) {
            console.log(`Updating ${updated.name} with camera:`, updated.currentCamera);
            newMulticams[index] = updated;
          }
        });
        console.log("New multicams:", newMulticams);
        return newMulticams;
      });
    } catch (err) {
      console.error('Error updating current selections:', err);
    }
  }, [isApplyingCamera, isConnected, multicams, obsService]);

  const refreshInterface = useCallback(async (forceRefresh = false) => {
    console.log("refreshInterface called, isConnected:", isConnected, "forceRefresh:", forceRefresh);
    if (!isConnected && !forceRefresh) {
      console.log("Not connected, skipping refreshInterface");
      return;
    }
    
    console.log("Starting refreshInterface...");
    setIsLoadingInterface(true);
    try {
      console.log("Calling obsService.getMulticamScenes()...");
      const multicamScenes = await obsService.getMulticamScenes();
      console.log("Got multicam scenes:", multicamScenes);
      
      console.log("Calling obsService.getCameraScenes()...");
      const cameras = await obsService.getCameraScenes();
      console.log("Got camera scenes:", cameras);

      setCameraScenes(cameras);
      
      const multicamData = multicamScenes.map(name => ({
        name,
        currentCamera: null,
        isLoading: false
      }));
      
      console.log("Setting multicam data:", multicamData);
      setMulticams(multicamData);
      
      // Update current selections
      console.log("Calling updateCurrentSelections...");
      await updateCurrentSelections(multicamScenes, forceRefresh);
      console.log("refreshInterface completed successfully");
    } catch (err) {
      const error = err as Error;
      console.error("Error in refreshInterface:", error);
      throw error;
    } finally {
      setIsLoadingInterface(false);
    }
  }, [isConnected, obsService, updateCurrentSelections]);

  const setMulticamLoading = useCallback((multicamName: string, loading: boolean) => {
    setMulticams(prev => prev.map(m => 
      m.name === multicamName ? { ...m, isLoading: loading } : m
    ));
  }, []);

  const applyCamera = useCallback(async (multicamName: string, selectedCamera: string) => {
    setIsApplyingCamera(true);
    setMulticamLoading(multicamName, true);
    
    try {
      await obsService.replaceSceneItem(multicamName, selectedCamera);
      return { success: true, message: `✅ ${multicamName} mis à jour avec ${selectedCamera}` };
    } catch (err) {
      const error = err as Error;
      return { success: false, message: `❌ Erreur : ${error.message}` };
    } finally {
      setMulticamLoading(multicamName, false);
      setTimeout(() => {
        setIsApplyingCamera(false);
        updateCurrentSelections();
      }, 500);
    }
  }, [obsService, setMulticamLoading, updateCurrentSelections]);

  const applyAllCameras = useCallback(async () => {
    setIsApplyingCamera(true);
    
    // Get selected cameras from the DOM
    const multicamsToModify = multicams.filter(multicam => {
      const selectElement = document.getElementById(`select_${multicam.name}`.replace(/\s+/g, '_')) as HTMLSelectElement;
      return selectElement && selectElement.value;
    });

    try {
      let appliedCount = 0;
      for (const multicam of multicamsToModify) {
        const selectElement = document.getElementById(`select_${multicam.name}`.replace(/\s+/g, '_')) as HTMLSelectElement;
        const selectedCamera = selectElement.value;
        
        setMulticamLoading(multicam.name, true);
        await obsService.replaceSceneItem(multicam.name, selectedCamera);
        setMulticamLoading(multicam.name, false);
        appliedCount++;
      }
      
      if (appliedCount > 0) {
        return { success: true, message: `🎉 ${appliedCount} MULTICAM mis à jour !` };
      } else {
        return { success: false, message: "ℹ️ Aucune caméra sélectionnée" };
      }
    } catch (err) {
      const error = err as Error;
      return { success: false, message: `❌ Erreur : ${error.message}` };
    } finally {
      setTimeout(() => {
        setIsApplyingCamera(false);
        updateCurrentSelections();
      }, 500);
    }
  }, [multicams, obsService, setMulticamLoading, updateCurrentSelections]);

  return {
    multicams,
    cameraScenes,
    isLoadingInterface,
    isApplyingCamera,
    refreshInterface,
    updateCurrentSelections,
    applyCamera,
    applyAllCameras
  };
}
