import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { TEAM_DEFINITIONS, getOfficerTeam, getTeamOfficers } from "@/lib/team-config";

export interface FilterState {
  topN: number | 'all';
  minBalance: number;
  excludeOutliers: boolean;
  balanceTier: 'all' | 'mega' | 'large' | 'medium' | 'small';
  team: 'all' | string;
  officer: 'all' | string;
}

export const DEFAULT_FILTERS: FilterState = {
  topN: 'all',
  minBalance: 100000,
  excludeOutliers: true,
  balanceTier: 'all',
  team: 'all',
  officer: 'all',
};

interface DashboardFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  officerCount: number;
  availableOfficers: string[];
}

export function DashboardFilters({ filters, onChange, officerCount, availableOfficers }: DashboardFiltersProps) {
  const handleReset = () => {
    onChange(DEFAULT_FILTERS);
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* Team/Officer Filter */}
        <div className="flex items-center gap-2">
          <Label htmlFor="team-officer-filter" className="text-sm whitespace-nowrap">
            Team / Officer
          </Label>
          <Select
            value={filters.officer !== 'all' ? filters.officer : filters.team}
            onValueChange={(value) => {
              // Check if value is a team name
              if (value === 'all' || Object.keys(TEAM_DEFINITIONS).includes(value)) {
                onChange({ ...filters, team: value, officer: 'all' });
              } else {
                // It's an officer name - set both team and officer
                const team = getOfficerTeam(value);
                onChange({ ...filters, team, officer: value });
              }
            }}
          >
            <SelectTrigger id="team-officer-filter" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              <SelectItem value="all">All Teams</SelectItem>
              
              {/* Business Banking Team */}
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/5 border-l-2 border-primary py-2 pl-3 -mx-1 mt-2 first:mt-0">Business Banking</SelectLabel>
                <SelectItem value="Business Banking" className="pl-6 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    All Business Banking
                  </span>
                </SelectItem>
                {getTeamOfficers('Business Banking', availableOfficers)
                  .sort()
                  .map(officer => (
                    <SelectItem key={officer} value={officer} className="pl-10 text-muted-foreground">
                      {officer}
                    </SelectItem>
                  ))}
              </SelectGroup>

              {/* OCF Team */}
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/5 border-l-2 border-accent py-2 pl-3 -mx-1 mt-2">OCF</SelectLabel>
                <SelectItem value="OCF" className="pl-6 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    All OCF
                  </span>
                </SelectItem>
                {getTeamOfficers('OCF', availableOfficers)
                  .sort()
                  .map(officer => (
                    <SelectItem key={officer} value={officer} className="pl-10 text-muted-foreground">
                      {officer}
                    </SelectItem>
                  ))}
              </SelectGroup>

              {/* Personal Banking Team */}
              <SelectGroup>
                <SelectLabel className="text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/5 border-l-2 border-secondary py-2 pl-3 -mx-1 mt-2">Personal Banking</SelectLabel>
                <SelectItem value="Personal Banking" className="pl-6 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-secondary" />
                    All Personal Banking
                  </span>
                </SelectItem>
                {getTeamOfficers('Personal Banking', availableOfficers)
                  .sort()
                  .map(officer => (
                    <SelectItem key={officer} value={officer} className="pl-10 text-muted-foreground">
                      {officer}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* View Preset */}
        <div className="flex items-center gap-2">
          <Label htmlFor="view-preset" className="text-sm whitespace-nowrap">
            Show
          </Label>
          <Select
            value={filters.topN.toString()}
            onValueChange={(value) => 
              onChange({ ...filters, topN: value === 'all' ? 'all' : parseInt(value), team: 'all', officer: 'all' })
            }
          >
            <SelectTrigger id="view-preset" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Officers</SelectItem>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="15">Top 15</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min Balance */}
        <div className="flex items-center gap-2">
          <Label htmlFor="min-balance" className="text-sm whitespace-nowrap">
            Min Balance
          </Label>
          <Select
            value={filters.minBalance.toString()}
            onValueChange={(value) => 
              onChange({ ...filters, minBalance: parseInt(value) })
            }
          >
            <SelectTrigger id="min-balance" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any</SelectItem>
              <SelectItem value="100000">$100K+</SelectItem>
              <SelectItem value="500000">$500K+</SelectItem>
              <SelectItem value="1000000">$1M+</SelectItem>
              <SelectItem value="5000000">$5M+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Exclude Outliers */}
        <div className="flex items-center gap-2">
          <Switch
            id="exclude-outliers"
            checked={filters.excludeOutliers}
            onCheckedChange={(checked) => 
              onChange({ ...filters, excludeOutliers: checked })
            }
          />
          <Label htmlFor="exclude-outliers" className="text-sm whitespace-nowrap cursor-pointer">
            Exclude Outliers
          </Label>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="ml-auto"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>

        {/* Officer Count Badge */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-accent">{officerCount}</span> officers shown
        </div>
      </div>
    </Card>
  );
}
