import React from "react";
import { useSettingsStore } from "@/stores/settings-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Globe, BookOpen, Newspaper, Zap } from "lucide-react";

export function ToolSettings() {
  const {
    agenticConfig,
    setToolsEnabled,
    setWebSearchEnabled,
    setWikipediaEnabled,
    setNewsSearchEnabled,
  } = useSettingsStore();

  const toolsEnabledCount = [
    agenticConfig.webSearchEnabled,
    agenticConfig.wikipediaEnabled,
    agenticConfig.newsSearchEnabled,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Main Tools Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Web Search Tools
              </CardTitle>
              <CardDescription>
                Enable external search capabilities to enhance responses with
                current information
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {agenticConfig.toolsEnabled && (
                <Badge variant="secondary" className="text-xs">
                  {toolsEnabledCount} tool{toolsEnabledCount !== 1 ? "s" : ""}{" "}
                  enabled
                </Badge>
              )}
              <Switch
                checked={agenticConfig.toolsEnabled}
                onCheckedChange={setToolsEnabled}
              />
            </div>
          </div>
        </CardHeader>

        {agenticConfig.toolsEnabled && (
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                Tools will automatically activate when your queries need current
                information, web resources, or when document context is limited.
              </p>
            </div>

            {/* Individual Tool Controls */}
            <div className="space-y-6">
              {/* Web Search Tool */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 mt-0.5 text-blue-600" />
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Web Search</Label>
                    <p className="text-sm text-muted-foreground">
                      Search the web for current information, tutorials, and
                      real-time data using DuckDuckGo
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Privacy-focused
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Current info
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        How-to guides
                      </Badge>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={agenticConfig.webSearchEnabled}
                  onCheckedChange={setWebSearchEnabled}
                  disabled={!agenticConfig.toolsEnabled}
                />
              </div>

              {/* Wikipedia Tool */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 mt-0.5 text-green-600" />
                  <div className="space-y-1">
                    <Label className="text-base font-medium">
                      Wikipedia Search
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Access reliable encyclopedic information and factual
                      content from Wikipedia
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Encyclopedic
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Factual
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Definitions
                      </Badge>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={agenticConfig.wikipediaEnabled}
                  onCheckedChange={setWikipediaEnabled}
                  disabled={!agenticConfig.toolsEnabled}
                />
              </div>

              {/* News Search Tool */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Newspaper className="w-5 h-5 mt-0.5 text-orange-600" />
                  <div className="space-y-1">
                    <Label className="text-base font-medium">News Search</Label>
                    <p className="text-sm text-muted-foreground">
                      Find recent news and current events from various sources
                      including tech news
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Breaking news
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Current events
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Tech news
                      </Badge>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={agenticConfig.newsSearchEnabled}
                  onCheckedChange={setNewsSearchEnabled}
                  disabled={!agenticConfig.toolsEnabled}
                />
              </div>
            </div>

            {/* Tool Usage Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">How Tools Work</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Tools activate automatically based on your query content
                </li>
                <li>
                  • Queries with &quot;latest&quot;, &quot;current&quot;,
                  &quot;today&quot; trigger news/web search
                </li>
                <li>
                  • Questions starting with &quot;what is&quot;, &quot;who
                  is&quot; prefer Wikipedia
                </li>
                <li>
                  • &quot;How to&quot; and tutorial requests use web search
                </li>
                <li>
                  • Tools enhance context when document knowledge is limited
                </li>
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tool Status Summary */}
      {!agenticConfig.toolsEnabled && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5" />
          <p className="text-sm text-gray-800">
            Web search tools are disabled. The assistant will rely only on local
            document knowledge and training data.
          </p>
        </div>
      )}
    </div>
  );
}
