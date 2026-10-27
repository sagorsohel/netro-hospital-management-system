import React from 'react';
import { Star, Phone, Award, Stethoscope } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export const DoctorsList: React.FC = () => {
  const doctors = useAppSelector((state) => state.doctors.doctors);

  return (
    <Card className="border border-slate-200/90 shadow-xs">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-dark">Hospital Specialists</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Medical specialists currently active on duty</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <Stethoscope className="h-4 w-4 text-primary" />
          <span>{doctors.length} Doctors Registered</span>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h4 className="font-semibold text-dark text-sm group-hover:text-secondary transition-colors">{doc.name}</h4>
                    <p className="text-xs text-primary font-medium">{doc.specialty}</p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{doc.rating}</span>
                      <span className="text-slate-400">({doc.patientsCount} patients)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-200/70 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-secondary" />
                    <span>{doc.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-secondary" />
                    <span>{doc.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between">
                <Badge
                  variant={doc.status === 'Active' ? 'success' : doc.status === 'In Surgery' ? 'warning' : 'outline'}
                >
                  {doc.status}
                </Badge>
                <span className="text-xs text-dark font-medium">{doc.department}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
