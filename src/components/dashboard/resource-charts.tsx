"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, Pie, PieChart } from "recharts"

const resourceData = [
  { time: "12:00", cpu: 30, memory: 45 },
  { time: "13:00", cpu: 40, memory: 50 },
  { time: "14:00", cpu: 20, memory: 40 },
  { time: "15:00", cpu: 50, memory: 60 },
  { time: "16:00", cpu: 42, memory: 55 },
  { time: "17:00", cpu: 60, memory: 70 },
  { time: "18:00", cpu: 55, memory: 65 },
]

const chartConfig = {
  cpu: {
    label: "CPU",
    color: "hsl(var(--chart-1))",
  },
  memory: {
    label: "Memory",
    color: "hsl(var(--chart-2))",
  },
}

const diskData = [
    { name: 'Used', value: 75, fill: 'hsl(var(--chart-1))' },
    { name: 'Free', value: 25, fill: 'hsl(var(--muted))' },
]

export function ResourceCharts() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>CPU and Memory usage over the last 6 hours.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart accessibilityLayer data={resourceData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 5)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <defs>
                            <linearGradient id="fillCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-cpu)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-cpu)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillMemory" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-memory)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-memory)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                        dataKey="cpu"
                        type="natural"
                        fill="url(#fillCpu)"
                        stroke="var(--color-cpu)"
                        stackId="a"
                        />
                        <Area
                        dataKey="memory"
                        type="natural"
                        fill="url(#fillMemory)"
                        stroke="var(--color-memory)"
                        stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Disk Usage</CardTitle>
                <CardDescription>Total disk space usage.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                 <ChartContainer config={{}} className="h-[200px] w-full max-w-[250px]">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={diskData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  )
}
