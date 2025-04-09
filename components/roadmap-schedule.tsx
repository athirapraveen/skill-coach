"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"

interface ScheduleUnit {
  id: string
  label: string
  content: string
  completed: boolean
}

interface RoadmapScheduleProps {
  scheduleUnits: ScheduleUnit[]
  onToggleComplete: (id: string) => void
}

export function RoadmapSchedule({ scheduleUnits, onToggleComplete }: RoadmapScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scheduleUnits.map((unit) => (
          <div key={unit.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`schedule-${unit.id}`}
                  checked={unit.completed}
                  onCheckedChange={() => onToggleComplete(unit.id)}
                />
                <span className="font-medium">{unit.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">{unit.content}</span>
            </div>
            <Progress value={unit.completed ? 100 : 0} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

