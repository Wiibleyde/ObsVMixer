# Debug Panel - Architecture

Ce dossier contient les composants refactorisés du panel de debug OBS, suivant une architecture modulaire et propre.

## Structure

### Hooks
- **`useOBSDebug.ts`** : Hook principal pour la logique de debug
  - Gestion de l'état des scènes et multicams
  - Gestion des erreurs et du loading
  - Auto-nettoyage lors de la déconnexion
  - Fonctionnalités : charger scènes, tester multicams, actualiser tout

- **`useDebugPanelStyles.ts`** : Hook pour la gestion centralisée des styles
  - Styles typés pour tous les composants
  - Facilite la maintenance et la cohérence visuelle

### Composants Debug (`/src/components/debug/`)

- **`DebugActions.tsx`** : Composant pour les boutons d'action
  - Boutons de chargement des scènes et test multicam
  - Bouton d'actualisation complète
  - Bouton d'effacement
  - Affichage des erreurs et dernière mise à jour

- **`SceneListDisplay.tsx`** : Affichage de la liste des scènes
  - Liste scrollable des scènes OBS
  - Tooltips informatifs

- **`MulticamInfoDisplay.tsx`** : Affichage des infos multicam
  - État des caméras dans chaque scène CAMSELECT
  - Codes couleur (vert = caméra active, rouge = aucune caméra)

- **`index.ts`** : Exports centralisés pour une importation propre

### Composant Principal
- **`DebugPanel.tsx`** : Composant principal refactorisé
  - Utilise tous les hooks et sous-composants
  - Interface simple et claire
  - Masquage automatique si déconnecté

## Fonctionnalités

### Nouvelles améliorations
- ✅ **Gestion d'erreur améliorée** : Messages d'erreur informatifs
- ✅ **Horodatage** : Affichage de la dernière mise à jour
- ✅ **Actualisation complète** : Bouton pour charger scènes + tester multicams en une fois
- ✅ **Auto-nettoyage** : Nettoyage automatique lors de la déconnexion
- ✅ **Meilleure UX** : Tooltips, icônes, codes couleur
- ✅ **Code modulaire** : Séparation claire de la logique et de l'affichage

### Fonctionnalités existantes conservées
- ✅ **Chargement des scènes** : Liste toutes les scènes OBS disponibles
- ✅ **Test multicam** : Détecte les caméras actives dans les scènes CAMSELECT
- ✅ **Interface de debug** : Visualisation claire des données OBS
- ✅ **Logs détaillés** : Logs console pour le debug technique

## Usage

```tsx
import DebugPanel from './components/DebugPanel';

<DebugPanel 
  obsService={obsService} 
  isConnected={isConnected} 
/>
```

## Types

Tous les types sont exportés depuis les hooks et peuvent être utilisés pour l'extension :

```tsx
import type { DebugInfo, UseOBSDebugReturn } from './hooks/useOBSDebug';
import type { DebugPanelStyles } from './hooks/useDebugPanelStyles';
```

## Avantages de la nouvelle architecture

1. **Modulaire** : Chaque composant a une responsabilité claire
2. **Réutilisable** : Les hooks peuvent être utilisés dans d'autres composants
3. **Maintenable** : Styles centralisés, logique séparée
4. **Typé** : TypeScript strict pour éviter les erreurs
5. **Testable** : Composants et hooks facilement testables
6. **Extensible** : Facile d'ajouter de nouvelles fonctionnalités
