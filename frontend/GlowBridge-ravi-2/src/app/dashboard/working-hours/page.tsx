"use client";

import { useState, useEffect } from "react";
import {
  fetchStaffAvailability,
  StaffAvailabilityItem,
  updateStaffAvailability,
} from "@/lib/userApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Edit, Save, X } from "lucide-react";

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
  availabilityId?: string;
  dayOfWeek: number;
}

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
const dayNumberToName: Record<number, DayOfWeek> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
};

interface Staff {
  id: string;
  name: string;
  avatar: string;
  role: string;
  salon: string;
  schedule: Record<DayOfWeek, DaySchedule>;
  totalHours: number;
  status: string;
  email: string;
  contact_number: string;
}
const transformStaffAvailability = (
  apiData: StaffAvailabilityItem[]
): Staff[] => {
  const staffMap = new Map<string, Staff>();

  apiData.forEach((item) => {
    const staffId = item.salon_staff_id;

    if (!staffMap.has(staffId)) {
      const emptySchedule: Record<DayOfWeek, DaySchedule> = {
        monday: { enabled: false, start: "09:00", end: "17:00", dayOfWeek: 1 },
        tuesday: { enabled: false, start: "09:00", end: "17:00", dayOfWeek: 2 },
        wednesday: {
          enabled: false,
          start: "09:00",
          end: "17:00",
          dayOfWeek: 3,
        },
        thursday: {
          enabled: false,
          start: "09:00",
          end: "17:00",
          dayOfWeek: 4,
        },
        friday: { enabled: false, start: "09:00", end: "17:00", dayOfWeek: 5 },
        saturday: {
          enabled: false,
          start: "09:00",
          end: "17:00",
          dayOfWeek: 6,
        },
        sunday: { enabled: false, start: "09:00", end: "17:00", dayOfWeek: 7 },
      };

      staffMap.set(staffId, {
        id: staffId,
        name: `${item.first_name} ${item.last_name}`,
        avatar: "",
        role: item.role,
        salon: item.salon_name,
        schedule: emptySchedule,
        totalHours: 0,
        status: "Active",
        email: item.email,
        contact_number: item.contact_number,
      });
    }

    const staff = staffMap.get(staffId)!;
    const dayName = dayNumberToName[item.day_of_week];

    if (dayName) {
      staff.schedule[dayName] = {
        enabled: item.is_available,
        start: item.start_time.substring(0, 5),
        end: item.end_time.substring(0, 5),
        availabilityId: item.id,
        dayOfWeek: item.day_of_week,
      };
    }
  });

  staffMap.forEach((staff) => {
    let totalHours = 0;
    Object.values(staff.schedule).forEach((day) => {
      if (day.enabled) {
        const startHour = parseInt(day.start.split(":")[0]);
        const startMin = parseInt(day.start.split(":")[1]);
        const endHour = parseInt(day.end.split(":")[0]);
        const endMin = parseInt(day.end.split(":")[1]);

        const startTotalMin = startHour * 60 + startMin;
        const endTotalMin = endHour * 60 + endMin;
        const dayHours = (endTotalMin - startTotalMin) / 60;

        totalHours += dayHours;
      }
    });
    staff.totalHours = Math.round(totalHours);
  });

  return Array.from(staffMap.values());
};

const daysOfWeek: Array<{ key: DayOfWeek; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

function StaffScheduleCard({
  staff,
  onUpdate,
}: {
  staff: Staff;
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState(staff.schedule);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const updatePromises: Promise<{ message: string }>[] = [];

      daysOfWeek.forEach((day) => {
        const originalDay = staff.schedule[day.key];
        const editedDay = editedSchedule[day.key];

        const hasChanges =
          originalDay.enabled !== editedDay.enabled ||
          originalDay.start !== editedDay.start ||
          originalDay.end !== editedDay.end;

        if (hasChanges && editedDay.availabilityId) {
          const updatePromise = updateStaffAvailability(
            editedDay.availabilityId,
            {
              day_of_week: editedDay.dayOfWeek,
              start_time: editedDay.start,
              end_time: editedDay.end,
              is_available: editedDay.enabled,
            }
          );
          updatePromises.push(updatePromise);
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        onUpdate();
      }

      setIsEditing(false);
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedSchedule(staff.schedule);
    setIsEditing(false);
    setSaveError(null);
  };

  const toggleDay = (day: DayOfWeek) => {
    setEditedSchedule({
      ...editedSchedule,
      [day]: {
        ...editedSchedule[day],
        enabled: !editedSchedule[day].enabled,
      },
    });
  };

  const updateTime = (
    day: DayOfWeek,
    timeType: "start" | "end",
    value: string
  ) => {
    setEditedSchedule({
      ...editedSchedule,
      [day]: {
        ...editedSchedule[day],
        [timeType]: value,
      },
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={staff.avatar || "/placeholder.svg"}
                alt={staff.name}
              />
              <AvatarFallback>
                {staff.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{staff.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{staff.role}</span>
                <span>•</span>
                <span>{staff.salon}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {staff.totalHours}h/week
            </Badge>
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-3 w-3 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}
        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const daySchedule = isEditing
              ? editedSchedule[day.key]
              : staff.schedule[day.key];
            return (
              <div
                key={day.key}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <Switch
                      checked={daySchedule.enabled}
                      onCheckedChange={() => toggleDay(day.key)}
                    />
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${
                        daySchedule.enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                  <Label className="font-medium text-gray-900 w-20">
                    {day.label}
                  </Label>
                </div>

                {daySchedule.enabled ? (
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Input
                          type="time"
                          value={daySchedule.start}
                          onChange={(e) =>
                            updateTime(day.key, "start", e.target.value)
                          }
                          className="w-24 h-8"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={daySchedule.end}
                          onChange={(e) =>
                            updateTime(day.key, "end", e.target.value)
                          }
                          className="w-24 h-8"
                        />
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>
                          {daySchedule.start} - {daySchedule.end}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600"
                  >
                    Day Off
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkingHoursPage() {
  const [staffWorkingHours, setStaffWorkingHours] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaffAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiData = await fetchStaffAvailability();
      const transformedData = transformStaffAvailability(apiData);
      setStaffWorkingHours(transformedData);
    } catch {
      setError("Failed to load staff availability data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffAvailability();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Working Hours
            </h1>
            <p className="text-gray-600 mt-2">
              Loading staff availability data...
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Working Hours
            </h1>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Staff Working Hours
          </h1>
          <p className="text-gray-600 mt-2">
            Manage working days and hours for all staff members
          </p>
        </div>
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {staffWorkingHours.length}
            </div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(
                staffWorkingHours.reduce(
                  (acc, staff) => acc + staff.totalHours,
                  0
                ) / staffWorkingHours.length
              )}
              h
            </div>
            <p className="text-xs text-muted-foreground">Per week</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {staffWorkingHours.reduce(
                (acc, staff) => acc + staff.totalHours,
                0
              )}
              h
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="space-y-6">
        {staffWorkingHours.length > 0 ? (
          staffWorkingHours.map((staff) => (
            <StaffScheduleCard
              key={staff.id}
              staff={staff}
              onUpdate={loadStaffAvailability}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <CardContent>
              <p className="text-gray-500">No staff availability data found.</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
