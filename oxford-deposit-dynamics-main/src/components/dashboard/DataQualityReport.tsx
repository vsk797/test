import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, ChevronDown, ChevronRight, AlertCircle, Info, XCircle } from "lucide-react";
import { DataQualityIssue } from "@/lib/data-processor";
import { useState } from "react";

interface DataQualityReportProps {
  issues: DataQualityIssue[];
  stats: {
    totalRows: number;
    validRows: number;
    filteredRows: number;
  };
}

export function DataQualityReport({ issues, stats }: DataQualityReportProps) {
  const [isOpen, setIsOpen] = useState(false);

  const errorIssues = issues.filter(i => i.severity === 'error');
  const warningIssues = issues.filter(i => i.severity === 'warning');
  const infoIssues = issues.filter(i => i.severity === 'info');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'destructive' | 'secondary' | 'default'> = {
      error: 'destructive',
      warning: 'secondary',
      info: 'default'
    };
    return variants[severity] || 'default';
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <button className="hover:bg-accent rounded-sm p-1 transition-colors">
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CardTitle className="text-xl">Data Quality Report</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {errorIssues.length > 0 && (
                <Badge variant="destructive">
                  {errorIssues.length} filtered
                </Badge>
              )}
              {warningIssues.length > 0 && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  {warningIssues.length} warnings
                </Badge>
              )}
              {infoIssues.length > 0 && (
                <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  {infoIssues.length} corrected
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Processed {stats.totalRows} rows • {stats.validRows} valid • {stats.filteredRows} filtered
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            {issues.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No data quality issues detected</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Row</TableHead>
                      <TableHead className="w-24">Severity</TableHead>
                      <TableHead className="w-32">Type</TableHead>
                      <TableHead>Household</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-32">Field</TableHead>
                      <TableHead className="w-32">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.map((issue, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{issue.rowIndex}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(issue.severity)}
                            <Badge variant={getSeverityBadge(issue.severity)} className="text-xs">
                              {issue.severity}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {issue.issueType.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {issue.householdName}
                          <div className="text-xs text-muted-foreground">{issue.householdId}</div>
                        </TableCell>
                        <TableCell className="text-sm">{issue.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {issue.field || '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {issue.rawValue || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
