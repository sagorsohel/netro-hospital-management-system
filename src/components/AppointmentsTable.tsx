import React from 'react';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setFilterStatus, updateStatus, type Appointment } from '../store/slices/appointmentsSlice';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export const AppointmentsTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { appointments, filterStatus } = useAppSelector((state) => state.appointments);

  const filters = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'];

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === 'All') return true;
    return apt.status === filterStatus;
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'Pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'Completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  return (
    <Card className="border border-slate-200/90 shadow-xs">
      <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100">
        <div>
          <CardTitle className="text-lg font-bold text-dark">Recent Appointments</CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Real-time schedule and patient consultation records
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => dispatch(setFilterStatus(filter))}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterStatus === filter
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-dark hover:text-secondary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream/40 border-b border-slate-100 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">ID & Patient</th>
                <th className="py-3.5 px-6">Doctor & Dept</th>
                <th className="py-3.5 px-6">Date & Time</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No appointments found for "{filterStatus}".
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-cream/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-dark hover:text-secondary transition-colors">{apt.patientName}</div>
                      <div className="text-xs text-slate-400 font-mono">{apt.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-dark">{apt.doctorName}</div>
                      <div className="text-xs text-secondary font-medium">{apt.department}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-dark text-xs">
                        <Calendar className="h-3.5 w-3.5 text-secondary" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{apt.time}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2.5 py-1 rounded-md">
                        {apt.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(apt.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-primary/40 text-primary hover:text-primary-hover hover:bg-primary/10"
                            onClick={() => dispatch(updateStatus({ id: apt.id, status: 'Confirmed' }))}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-primary" />
                            Confirm
                          </Button>
                        )}
                        {apt.status === 'Confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-secondary/40 text-secondary hover:text-secondary-hover hover:bg-secondary/10"
                            onClick={() => dispatch(updateStatus({ id: apt.id, status: 'Completed' }))}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-secondary" />
                            Complete
                          </Button>
                        )}
                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                          <button
                            onClick={() => dispatch(updateStatus({ id: apt.id, status: 'Cancelled' }))}
                            className="p-1.5 text-slate-400 hover:text-accent rounded-md hover:bg-accent/10 transition-colors cursor-pointer"
                            title="Cancel appointment"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
