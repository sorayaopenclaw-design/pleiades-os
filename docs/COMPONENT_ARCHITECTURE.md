# Pleiades OS Dashboard - Component Architecture

## Component Blueprints for The Builder

---

## 1. MorningReport.tsx

### Interface Definitions
```typescript
interface MorningReportProps {
  nightWatchLogs: NightWatchLog[];
  vpsStatus: VPSStatus | null;
  stats: DashboardStats;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'purple' | 'pink' | 'blue' | 'cyan';
}
```

### Props Interface
```typescript
interface MorningReportProps {
  nightWatchLogs: NightWatchLog[];
  vpsStatus: VPSStatus | null;
  stats: DashboardStats;
}
```

### State Management Approach
- **Local State**: `expandedSections` (Record<string, boolean>) for collapsible sections
- **Derived Data**: 
  - `lastNightWatchRun` - Get most recent log timestamp
  - `successRate` - Calculate from logs (success / total)
  - `apiCostEstimate` - Sum from log details if available
- **Store Selectors**: 
  - `useNightWatchLogs()`
  - `useVPSStatus()`
  - `useStats()`

### Key Rendering Logic (Pseudocode)
```
RENDER MorningReport:
  Container: cosmic-panel with glassmorphism
  
  HEADER:
    Title: "Morning Report" + current date
    Greeting: "Good {timeOfDay}, Commander"
  
  GRID (2 columns on desktop, 1 on mobile):
    
    CARD 1: VPS Health
      Icon: Server icon
      Title: "VPS Status"
      IF vpsStatus:
        Badge: uptime (green if >99%)
        ProgressBar: CPU load
        ProgressBar: Memory usage
        List: Docker containers (3 max, scrollable)
      ELSE:
        Skeleton loader or "No data"
    
    CARD 2: Night Watch Summary
      Icon: Moon/Clock icon
      Title: "Night Watch"
      Counter: {successCount}/{totalCount} successful
      Mini-list: Last 3 logs with status dots
      Status indicator: "Last run: {timeAgo}"
    
    CARD 3: Quick Stats
      Icon: Chart icon
      Grid of 4 mini-stats:
        - Active Decisions: {stats.activeDecisions}
        - Agents Online: {stats.activeAgents}
        - API Costs: ${apiCostEstimate}
        - Tasks Done: {completedTasks}
    
    CARD 4: System Health
      Icon: Heart/Activity icon
      Health score calculation
      Color-coded status
      Last backup timestamp
```

### CSS Classes (Tailwind Cosmic Theme)
```
CONTAINER:
  "cosmic-panel rounded-2xl p-6 backdrop-blur-xl bg-cosmic-panel/80 border border-white/10 shadow-xl"

HEADER:
  "flex items-center justify-between mb-6"
  Title: "text-2xl font-display font-bold text-white"
  Date: "text-cosmic-cyan text-sm"

CARD:
  "bg-cosmic-dark/50 rounded-xl p-4 border border-white/5 hover:border-cosmic-purple/30 transition-all duration-300"

ICON CONTAINER:
  "w-10 h-10 rounded-lg bg-gradient-to-br from-cosmic-purple/20 to-cosmic-pink/20 flex items-center justify-center"

STAT VALUE:
  "text-3xl font-bold text-white"
  "text-cosmic-purple" | "text-cosmic-pink" | "text-cosmic-blue" | "text-cosmic-cyan"

BADGE (VPS):
  "px-2 py-1 rounded-full text-xs font-medium"
  Success: "bg-green-500/20 text-green-400 border border-green-500/30"
  Warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
  Error: "bg-red-500/20 text-red-400 border border-red-500/30"

PROGRESS BAR:
  "h-2 bg-cosmic-dark rounded-full overflow-hidden"
  Fill: "h-full rounded-full transition-all duration-500"
  "bg-cosmic-purple" | "bg-cosmic-cyan" | "bg-cosmic-pink"
```

---

## 2. DecisionPanel.tsx

### Interface Definitions
```typescript
interface DecisionPanelProps {
  decisions: Decision[];
  approveDecision: (id: string) => void;
  rejectDecision: (id: string) => void;
}

interface DecisionCardProps {
  decision: CategorizedDecision;
  onApprove: () => void;
  onReject: () => void;
}

type CategoryFilter = 'all' | ProjectType;
```

### Props Interface
```typescript
interface DecisionPanelProps {
  decisions: Decision[];
  approveDecision: (id: string) => void;
  rejectDecision: (id: string) => void;
}
```

### State Management Approach
- **Local State**:
  - `selectedCategory`: CategoryFilter (default: 'all')
  - `sortBy`: 'priority' | 'date' | 'category'
  - `searchQuery`: string
- **Derived Data**:
  - `filteredDecisions` - Filter by category + search
  - `categoryCounts` - Count per category for tabs
- **Store Actions**:
  - `approveDecision(id)`
  - `rejectDecision(id)`

### Key Rendering Logic (Pseudocode)
```
RENDER DecisionPanel:
  Container: full-height cosmic-panel
  
  HEADER:
    Title: "Decision Queue"
    Search input with icon
    Sort dropdown
  
  CATEGORY TABS (horizontal scroll):
    "All" tab with total count
    For each category in ['metrichealth', 'firebird', 'roots-of-reality', 'library', 'substack']:
      Tab with category icon + count
      Active tab: gradient background + glow
  
  DECISION LIST (virtualized if >20 items):
    For each decision in filteredDecisions:
      DecisionCard:
        
        CARD HEADER:
          Priority badge (urgent=red, high=orange, medium=yellow, low=blue)
          Category badge with icon
          Timestamp (relative)
        
        CARD BODY:
          Title (truncated if long)
          Description (2 lines max, fade out)
          Context hint (lighter text)
        
        CARD FOOTER:
          Approve button (green, check icon)
          Reject button (red, x icon)
          "Spawn Agent" hint (if approved)
  
  EMPTY STATE:
    If no decisions:
      Icon: Checkmark in circle
      Text: "All caught up!"
      Subtext: "No pending decisions"
```

### CSS Classes (Tailwind Cosmic Theme)
```
CONTAINER:
  "cosmic-panel rounded-2xl h-full flex flex-col backdrop-blur-xl bg-cosmic-panel/80"

HEADER:
  "p-6 border-b border-white/10"
  Title: "text-xl font-display font-bold text-white"

CATEGORY TABS:
  Container: "flex gap-2 p-4 overflow-x-auto scrollbar-hide"
  Tab: "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200"
  Tab Active: "bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white shadow-glow"
  Tab Inactive: "bg-cosmic-dark/50 text-gray-400 hover:text-white hover:bg-cosmic-dark"

PRIORITY BADGE:
  "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
  Urgent: "bg-red-500/20 text-red-400 border border-red-500/30"
  High: "bg-orange-500/20 text-orange-400 border border-orange-500/30"
  Medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
  Low: "bg-blue-500/20 text-blue-400 border border-blue-500/30"

CATEGORY BADGE:
  "px-2 py-0.5 rounded text-xs flex items-center gap-1"
  metricHEALTH: "bg-emerald-500/20 text-emerald-400"
  Firebird: "bg-orange-500/20 text-orange-400"
  Roots: "bg-purple-500/20 text-purple-400"
  Library: "bg-blue-500/20 text-blue-400"

DECISION CARD:
  "p-4 rounded-xl bg-cosmic-dark/30 border border-white/5 hover:border-cosmic-purple/30 transition-all duration-200 group"
  Hover: "transform hover:scale-[1.02] hover:shadow-lg"

ACTION BUTTONS:
  Approve: "flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 transition-colors flex items-center justify-center gap-2"
  Reject: "flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors flex items-center justify-center gap-2"
```

---

## 3. BrainPanel.tsx

### Interface Definitions
```typescript
interface BrainPanelProps {
  memoryFiles: MemoryFile[];
  searchMemory: (query: string) => MemoryFile[];
}

interface CategoryFilter {
  id: 'all' | 'ola-research' | 'spike-prime' | 'university-app' | 'quantum-ml' | 'session-logs';
  label: string;
  icon: string;
}

interface FileListItemProps {
  file: MarkdownDocument;
  isSelected: boolean;
  onClick: () => void;
}
```

### Props Interface
```typescript
interface BrainPanelProps {
  memoryFiles: MemoryFile[];
  searchMemory: (query: string) => MemoryFile[];
}
```

### State Management Approach
- **Local State**:
  - `searchQuery`: string
  - `selectedCategory`: CategoryFilter['id']
  - `selectedFileId`: string | null
  - `viewMode`: 'list' | 'grid'
- **Derived Data**:
  - `filteredFiles` - Apply search + category filter
  - `selectedFileContent` - Fetch content when file selected
- **Store Selectors**:
  - `useMemoryFiles()`
  - `searchMemory(query)` method from store

### Key Rendering Logic (Pseudocode)
```
RENDER BrainPanel:
  Container: full-height cosmic-panel with sidebar layout
  
  SIDEBAR (left, 320px):
    HEADER:
      Title: "The Brain" + brain icon
      Search input with debounced onChange
    
    CATEGORY FILTERS:
      Vertical list of categories:
        - All Documents
        - OLA Research
        - SPIKE Prime Docs
        - University Materials
        - QML Notes
        - Session Logs
      Each with icon and count badge
    
    FILE LIST (scrollable):
      For each file in filteredFiles:
        FileListItem:
          Icon based on category
          Filename (truncated)
          Last modified date
          Highlight if matches search
          Selected state styling
  
  CONTENT AREA (right, flex-1):
    IF selectedFile:
      MarkdownRenderer:
        Header: Filename + category badge + last modified
        Toolbar: Copy, Download, Close buttons
        Content: 
          - Parse markdown
          - Syntax highlighting for code blocks
          - Clickable links
          - Smooth scroll
    ELSE:
      EmptyState:
        Icon: Brain/Book
        Text: "Select a document to view"
        Quick links to recently modified files
```

### CSS Classes (Tailwind Cosmic Theme)
```
CONTAINER:
  "cosmic-panel rounded-2xl h-full flex overflow-hidden backdrop-blur-xl bg-cosmic-panel/80"

SIDEBAR:
  "w-80 border-r border-white/10 flex flex-col bg-cosmic-dark/30"

SEARCH INPUT:
  "w-full px-4 py-2 rounded-lg bg-cosmic-dark/50 border border-white/10 text-white placeholder-gray-500 focus:border-cosmic-purple focus:outline-none focus:ring-1 focus:ring-cosmic-purple"

CATEGORY ITEM:
  "px-4 py-2 flex items-center gap-3 cursor-pointer transition-colors"
  Hover: "bg-white/5"
  Active: "bg-cosmic-purple/20 border-r-2 border-cosmic-purple"
  Icon: "w-5 h-5 text-cosmic-cyan"
  Label: "text-sm text-gray-300"
  Count: "ml-auto text-xs text-gray-500 bg-cosmic-dark px-2 py-0.5 rounded-full"

FILE LIST ITEM:
  "px-4 py-3 border-b border-white/5 cursor-pointer transition-all"
  Hover: "bg-white/5"
  Selected: "bg-cosmic-purple/10 border-l-2 border-l-cosmic-purple"
  Filename: "text-sm font-medium text-white truncate"
  Preview: "text-xs text-gray-500 truncate mt-1"
  Date: "text-xs text-cosmic-cyan mt-1"

CONTENT HEADER:
  "px-6 py-4 border-b border-white/10 flex items-center justify-between"
  Title: "text-lg font-display font-bold text-white"

MARKDOWN CONTENT:
  "flex-1 overflow-y-auto p-6 prose prose-invert prose-cosmic max-w-none"
  Headers: "text-cosmic-purple"
  Links: "text-cosmic-cyan hover:text-cosmic-pink"
  Code blocks: "bg-cosmic-dark/80 rounded-lg p-4"
  Inline code: "bg-cosmic-dark/50 text-cosmic-pink px-1.5 py-0.5 rounded"
  Blockquote: "border-l-4 border-cosmic-purple pl-4 italic text-gray-400"
```

---

## 4. AutomationsPanel.tsx

### Interface Definitions
```typescript
interface AutomationsPanelProps {
  houndDeadlines: HoundDeadline[];
  nightWatchLogs: NightWatchLog[];
}

interface DeadlineCardProps {
  deadline: HoundDeadline;
  onClick?: () => void;
}

interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileTreeNode[];
  status?: 'active' | 'paused' | 'failed';
  lastRun?: string;
  nextRun?: string;
}
```

### Props Interface
```typescript
interface AutomationsPanelProps {
  houndDeadlines: HoundDeadline[];
  nightWatchLogs: NightWatchLog[];
}
```

### State Management Approach
- **Local State**:
  - `expandedNodes`: Set<string> - Track expanded folders
  - `selectedProject`: string | null
  - `viewMode`: 'tree' | 'timeline'
- **Derived Data**:
  - `fileTree` - Build from nightWatchLogs paths
  - `upcomingDeadlines` - Sort houndDeadlines by daysRemaining
  - `overdueCount` - Count of 'overdue' status
- **Store Selectors**:
  - `useHoundDeadlines()`
  - `useNightWatchLogs()`

### Key Rendering Logic (Pseudocode)
```
RENDER AutomationsPanel:
  Container: cosmic-panel
  
  HEADER:
    Title: "Automations" + gear icon
    View toggle: Tree | Timeline
    Status summary: X active, Y paused, Z failed
  
  TAB: DEADLINES (priority view):
    Alert banner if overdueCount > 0:
      "{overdueCount} deadlines overdue"
    
    Grid of deadline cards:
      For each deadline in sortedDeadlines:
        DeadlineCard:
          Project name with link icon (tirtheshjani.com)
          Task description
          Days remaining badge:
            Red: overdue
            Orange: < 3 days
            Yellow: < 7 days
            Green: > 7 days
          Priority indicator
          Status progress bar
  
  TAB: NIGHT WATCH (file tree):
    FileTree component:
      Root: "night-watch/"
      Expandable folders:
        - backups/
        - cleanup/
        - cost-tracking/
        - github-sync/
      Files show:
        - Status dot (green/yellow/red)
        - Last run timestamp
        - Schedule (cron expression)
      Click file -> Show log details panel
  
  LOG DETAILS PANEL (slide-out):
    Last run output (scrollable)
    Next scheduled run
    Edit schedule button (future)
    Run now button
```

### CSS Classes (Tailwind Cosmic Theme)
```
CONTAINER:
  "cosmic-panel rounded-2xl h-full flex flex-col backdrop-blur-xl bg-cosmic-panel/80"

HEADER:
  "p-6 border-b border-white/10 flex items-center justify-between"
  Title: "text-xl font-display font-bold text-white flex items-center gap-2"

VIEW TOGGLE:
  "flex bg-cosmic-dark/50 rounded-lg p-1"
  Button: "px-3 py-1 rounded text-sm transition-all"
  Active: "bg-cosmic-purple text-white"
  Inactive: "text-gray-400 hover:text-white"

ALERT BANNER:
  "px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 mx-6 mt-4"
  Icon: "text-red-400"
  Text: "text-red-300 text-sm"

DEADLINE CARD:
  "p-4 rounded-xl bg-cosmic-dark/30 border border-white/5 hover:border-cosmic-cyan/30 transition-all"
  Project link: "text-cosmic-cyan hover:underline flex items-center gap-1"
  Task: "text-white font-medium mt-1"

DAYS BADGE:
  "px-2 py-1 rounded-full text-xs font-bold"
  Overdue: "bg-red-500/20 text-red-400"
  At-risk: "bg-orange-500/20 text-orange-400"
  On-track: "bg-green-500/20 text-green-400"

FILE TREE:
  Container: "p-4 overflow-y-auto"
  Node: "flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-white/5"
  Folder icon: "text-cosmic-yellow"
  File icon: "text-cosmic-cyan"
  Status dot: "w-2 h-2 rounded-full"
  "bg-green-400" | "bg-yellow-400" | "bg-red-400"

TIMELINE VIEW:
  Container: "relative pl-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-cosmic-purple/30"
  Item: "relative mb-6"
  Dot: "absolute -left-5 w-4 h-4 rounded-full bg-cosmic-panel border-2 border-cosmic-purple"
  Content: "bg-cosmic-dark/30 rounded-lg p-3"
```

---

## 5. MissionControl.tsx

### Interface Definitions
```typescript
interface MissionControlProps {
  wsStatus: 'connected' | 'disconnected' | 'connecting';
  teams: Team[];
  agentWorkloads: AgentWorkload[];
}

interface ConnectionStatusProps {
  status: WebSocketStatus;
  lastPing: number;
  latency: number;
}

interface ActiveSessionCardProps {
  session: ActiveSession;
  isCurrent?: boolean;
}

interface RoutingIndicatorProps {
  routing: EngineRouting;
}
```

### Props Interface
```typescript
interface MissionControlProps {
  wsStatus: 'connected' | 'disconnected' | 'connecting';
  teams: Team[];
  agentWorkloads: AgentWorkload[];
}
```

### State Management Approach
- **Local State**:
  - `selectedTab`: 'overview' | 'sessions' | 'routing'
  - `refreshInterval`: number (for auto-refresh)
- **Derived Data**:
  - `totalActiveAgents` - From teams + workloads
  - `currentSession` - If any session is marked current
  - `routingModel` - Parse from system status
- **Store Selectors**:
  - `useWebSocket()` - wsStatus, connect, disconnect
  - `useTeams()`
  - `useAgentWorkloads()`

### Key Rendering Logic (Pseudocode)
```
RENDER MissionControl:
  Container: cosmic-panel with terminal aesthetic
  
  HEADER:
    Title: "Mission Control" + satellite icon
    Live indicator: pulsing dot if connected
    Connection toggle button
  
  CONNECTION STATUS BAR:
    Status pill with icon:
      Connected: Green pulsing dot + "LIVE"
      Connecting: Yellow spinner + "CONNECTING..."
      Disconnected: Red dot + "OFFLINE"
    Latency display (if connected)
    Last sync timestamp
  
  DASHBOARD GRID:
    
    WIDGET 1: Active Agents
      Large number: {totalActiveAgents}
      Breakdown by team (mini bar chart)
      Status dots legend
    
    WIDGET 2: Current Routing
      Primary model card:
        - Name (e.g., "kimi-k2.5")
        - Load percentage bar
        - Request count
        - Status badge
      Fallback model card (smaller):
        - Standby/active indicator
        - Failover ready badge
    
    WIDGET 3: Active Sessions
      Scrollable list:
        For each active session:
          SessionCard:
            Agent avatar + name
            Task description (truncated)
            Status badge (reasoning/executing/waiting)
            Progress bar if executing
            Token usage + cost
            Timestamp
    
    WIDGET 4: System Health
      Mini gauges:
        - Gateway status
        - WebSocket health
        - API rate limits
        - Error rate (last hour)
  
  FOOTER:
    Quick actions:
      - Reconnect WebSocket
      - Flush cache
      - View logs
```

### CSS Classes (Tailwind Cosmic Theme)
```
CONTAINER:
  "cosmic-panel rounded-2xl h-full flex flex-col backdrop-blur-xl bg-cosmic-panel/80 font-mono"

HEADER:
  "p-6 border-b border-white/10 flex items-center justify-between"
  Title: "text-xl font-display font-bold text-white flex items-center gap-2"

LIVE INDICATOR:
  "flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30"
  Dot: "w-2 h-2 rounded-full bg-green-400 animate-pulse"
  Text: "text-green-400 text-xs font-bold"

CONNECTION STATUS:
  Container: "px-6 py-4 bg-cosmic-dark/30 border-b border-white/10"
  Connected: "text-green-400"
  Connecting: "text-yellow-400"
  Disconnected: "text-red-400"

WIDGET GRID:
  "grid grid-cols-2 gap-4 p-6"

WIDGET:
  "bg-cosmic-dark/30 rounded-xl p-4 border border-white/5"
  Title: "text-xs text-gray-500 uppercase tracking-wider mb-3"

BIG NUMBER:
  "text-4xl font-bold text-white"
  Subtext: "text-sm text-gray-400"

ROUTING CARD:
  "p-3 rounded-lg bg-cosmic-dark/50 border border-cosmic-purple/20"
  Model name: "font-bold text-cosmic-cyan"
  Load bar: "h-1.5 bg-cosmic-dark rounded-full mt-2 overflow-hidden"
  Load fill: "h-full bg-gradient-to-r from-cosmic-purple to-cosmic-pink"

SESSION CARD:
  "p-3 rounded-lg bg-cosmic-dark/30 border border-white/5 mb-2"
  Avatar: "w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-pink"
  Status badge:
    Reasoning: "bg-purple-500/20 text-purple-400"
    Executing: "bg-blue-500/20 text-blue-400 animate-pulse"
    Waiting: "bg-yellow-500/20 text-yellow-400"
  
TERMINAL FOOTER:
  "px-6 py-3 bg-cosmic-dark/50 border-t border-white/10 text-xs text-gray-500 flex items-center gap-4"
  Action button: "text-cosmic-cyan hover:text-white transition-colors"
```

---

## 6. AgentOrgChart.tsx

### Interface Definitions
```typescript
interface AgentOrgChartProps {
  teams: Team[];
  updateAgentStatus: (teamId: string, agentId: string, status: AgentStatus) => void;
}

interface TeamSectionProps {
  team: Team;
  onAgentClick: (agent: Agent) => void;
  onStatusChange: (agentId: string, status: AgentStatus) => void;
}

interface AgentCardProps {
  agent: Agent;
  workload?: AgentWorkload;
  isExpanded: boolean;
  onClick: () => void;
  onStatusChange: (status: AgentStatus) => void;
}

type AgentStatus = 'active' | 'standby' | 'offline' | 'planned';
```

### Props Interface
```typescript
interface AgentOrgChartProps {
  teams: Team[];
  updateAgentStatus: (teamId: string, agentId: string, status: AgentStatus) => void;
}
```

### State Management Approach
- **Local State**:
  - `expandedAgentId`: string | null - Currently expanded agent card
  - `selectedTeam`: string | null - Filter by team
  - `statusFilter`: AgentStatus | 'all' - Filter by status
- **Derived Data**:
  - `filteredTeams` - Apply team + status filters
  - `agentWorkloadsMap` - Map agentId -> workload for quick lookup
- **Store Actions**:
  - `updateAgentStatus(teamId, agentId, status)`

### Key Rendering Logic (Pseudocode)
```
RENDER AgentOrgChart:
  Container: cosmic-panel with organizational chart layout
  
  HEADER:
    Title: "Agent Organization" + users icon
    Filter controls:
      - Team dropdown
      - Status toggle group (All | Active | Standby | Offline)
    Summary: "{activeCount}/{totalCount} agents active"
  
  ORG CHART LAYOUT:
    Vertical sections by team:
      
      For each team in filteredTeams:
        TEAM SECTION:
          Header:
            Team icon + name
            Agent count badge
            Expand/collapse toggle
          
          AGENT GRID (responsive):
            For each agent in team.agents:
              AgentCard:
                
                COLLAPSED STATE:
                  Avatar (generated from name)
                  Agent name
                  Role description
                  Status indicator dot
                  Workload preview (mini bar if active)
                
                EXPANDED STATE:
                  Full card with:
                    - Larger avatar
                    - Editable status toggle
                    - Current task (if active)
                    - Task progress bar
                    - Completed today count
                    - Pending tasks count
                    - Last active timestamp
                    - Action buttons:
                      * Assign task
                      * View history
                      * Edit agent
  
  AGENT DETAIL MODAL (optional):
    If agent selected:
      Modal overlay:
        - Full workload history
        - Task completion chart
        - Settings form
  
  EMPTY STATE:
    If no agents match filters:
      "No agents found"
      "Try adjusting your filters"
```

### CSS Classes (Tailwind Cosmic Theme)
```
CONTAINER:
  "cosmic-panel rounded-2xl h-full flex flex-col backdrop-blur-xl bg-cosmic-panel/80"

HEADER:
  "p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4"
  Title: "text-xl font-display font-bold text-white"

FILTER CONTROLS:
  "flex items-center gap-3"
  Dropdown: "px-3 py-1.5 rounded-lg bg-cosmic-dark/50 border border-white/10 text-sm text-white"
  Toggle group: "flex bg-cosmic-dark/50 rounded-lg p-1"
  Toggle button: "px-3 py-1 rounded text-xs font-medium transition-all"
  Active: "bg-cosmic-purple text-white"
  Inactive: "text-gray-400 hover:text-white"

TEAM SECTION:
  "mb-6 last:mb-0"
  Header: "flex items-center gap-3 px-6 py-3 bg-cosmic-dark/20 border-l-4 border-cosmic-purple"
  Icon: "text-2xl"
  Name: "font-bold text-white"
  Count: "ml-auto text-xs text-gray-500 bg-cosmic-dark px-2 py-0.5 rounded-full"

AGENT GRID:
  "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-6 pb-6"

AGENT CARD (collapsed):
  "p-4 rounded-xl bg-cosmic-dark/30 border border-white/5 cursor-pointer transition-all hover:border-cosmic-purple/30 hover:bg-cosmic-dark/50"
  Avatar: "w-12 h-12 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-pink flex items-center justify-center text-white font-bold text-lg mb-3"
  Name: "font-semibold text-white text-sm"
  Role: "text-xs text-gray-500"

STATUS DOT:
  "absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-cosmic-panel"
  Active: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
  Standby: "bg-yellow-400"
  Offline: "bg-gray-500"
  Planned: "bg-cosmic-cyan border-dashed"

AGENT CARD (expanded):
  "col-span-2 row-span-2 p-5 rounded-xl bg-cosmic-dark/50 border border-cosmic-purple/30 shadow-lg"
  Status toggle: "flex gap-2 mt-4"
  Toggle option: "flex-1 py-1.5 rounded text-xs font-medium transition-all"
  Selected: "bg-cosmic-purple text-white"
  Unselected: "bg-cosmic-dark text-gray-400 hover:text-white"

WORKLOAD BAR:
  "mt-3"
  Label: "flex justify-between text-xs text-gray-400 mb-1"
  Bar: "h-2 bg-cosmic-dark rounded-full overflow-hidden"
  Fill: "h-full bg-gradient-to-r from-cosmic-cyan to-cosmic-blue transition-all duration-500"

STATS ROW:
  "grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10"
  Stat: "text-center"
  Value: "text-lg font-bold text-white"
  Label: "text-xs text-gray-500"
```

---

## Shared Components Reference

### CosmicPanel Wrapper
```typescript
interface CosmicPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

// CSS: "rounded-2xl backdrop-blur-xl bg-cosmic-panel/80 border border-white/10 shadow-xl"
// With glow: "shadow-cosmic"
```

### PriorityBadge
```typescript
interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

// Maps priority to colors
```

### StatusDot
```typescript
interface StatusDotProps {
  status: 'active' | 'standby' | 'offline' | 'success' | 'warning' | 'error';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

### IconMapping
```typescript
const categoryIcons: Record<string, string> = {
  'metrichealth': 'Activity',
  'firebird': 'Flame',
  'roots-of-reality': 'BookOpen',
  'library': 'Library',
  'substack': 'Newspaper',
  'personal': 'User',
  'ola-research': 'Microscope',
  'spike-prime': 'Cpu',
  'university-app': 'GraduationCap',
  'quantum-ml': 'Atom',
};

const teamIcons: Record<string, string> = {
  'marketing': 'Megaphone',
  'product': 'Rocket',
  'research': 'Microscope',
  'utility': 'Settings',
};
```

---

## Animation Specifications

### Entrance Animations
- **Cards**: `animate-slide-up` with stagger delay (50ms per item)
- **Panels**: `animate-fade-in` + `animate-scale-in`
- **Status changes**: Pulse animation on the changed element

### Hover Effects
- **Cards**: `transform hover:scale-[1.02] transition-transform duration-200`
- **Buttons**: `hover:shadow-glow transition-shadow duration-200`
- **List items**: `hover:bg-white/5 transition-colors duration-150`

### Live Indicators
- **Connected**: `animate-pulse` on green dot
- **Executing**: `animate-pulse` on blue badge
- **Loading**: `animate-gradient-x` on skeleton bars

### Micro-interactions
- **Approve/Reject**: Scale up briefly on click (`active:scale-95`)
- **Expand card**: Smooth height transition with `transition-all duration-300`
- **Tab switch**: Underline slide or background fade

---

## File Locations for Builder

```
src/
  components/
    dashboard/
      MorningReport.tsx
      DecisionPanel.tsx
      BrainPanel.tsx
      AutomationsPanel.tsx
      MissionControl.tsx
      AgentOrgChart.tsx
    shared/
      CosmicPanel.tsx
      PriorityBadge.tsx
      StatusDot.tsx
      MarkdownRenderer.tsx
```

---

## Store Integration Quick Reference

### Selectors to Use
```typescript
// MorningReport
const nightWatchLogs = useDashboardStore((state) => state.nightWatchLogs);
const vpsStatus = useDashboardStore((state) => state.vpsStatus);
const stats = useDashboardStore((state) => state.stats);

// DecisionPanel
const decisions = useDashboardStore((state) => state.decisions);
const approveDecision = useDashboardStore((state) => state.approveDecision);
const rejectDecision = useDashboardStore((state) => state.rejectDecision);

// BrainPanel
const memoryFiles = useDashboardStore((state) => state.memoryFiles);
const searchMemory = useDashboardStore((state) => state.searchMemory);
const setSelectedMemory = useDashboardStore((state) => state.setSelectedMemory);

// AutomationsPanel
const houndDeadlines = useDashboardStore((state) => state.houndDeadlines);
const nightWatchLogs = useDashboardStore((state) => state.nightWatchLogs);

// MissionControl
const { wsStatus, connect, disconnect } = useWebSocket();
const teams = useDashboardStore((state) => state.teams);
const agentWorkloads = useDashboardStore((state) => state.agentWorkloads);

// AgentOrgChart
const teams = useDashboardStore((state) => state.teams);
const updateAgentStatus = useDashboardStore((state) => state.updateAgentStatus);
```

---

## Color System Reference

### Cosmic Theme Colors
| Token | Hex | Usage |
|-------|-----|-------|
| cosmic-dark | #0a0a0f | Background |
| cosmic-panel | #0f172a | Panel backgrounds |
| cosmic-purple | #8b5cf6 | Primary accent |
| cosmic-pink | #ec4899 | Secondary accent |
| cosmic-blue | #3b82f6 | Info/blue accents |
| cosmic-cyan | #06b6d4 | Highlights/links |

### Semantic Colors
| State | Background | Text | Border |
|-------|------------|------|--------|
| Success | bg-green-500/20 | text-green-400 | border-green-500/30 |
| Warning | bg-yellow-500/20 | text-yellow-400 | border-yellow-500/30 |
| Error | bg-red-500/20 | text-red-400 | border-red-500/30 |
| Info | bg-blue-500/20 | text-blue-400 | border-blue-500/30 |

---

## Responsive Breakpoints

```
Mobile: < 640px (1 column layouts)
Tablet: 640px - 1024px (2 column layouts)
Desktop: > 1024px (full layouts)
Wide: > 1280px (expanded layouts)
```

### Grid Patterns
```
MorningReport: grid-cols-1 md:grid-cols-2
DecisionPanel: flex-col (list view)
BrainPanel: flex-col lg:flex-row (sidebar + content)
AutomationsPanel: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
MissionControl: grid-cols-1 md:grid-cols-2
AgentOrgChart: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```
