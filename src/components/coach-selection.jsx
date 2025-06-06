"use client"
import { useEffect, useState } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useLocale, useTranslations } from 'next-intl'
import { useGetCoachQuery } from "@/redux/services/user.service";

export default function CoachSelection({ onSelect , coaches }) {  
  const t = useTranslations('BookingPage')
  
  const locale = useLocale();

  const {
    isLoading,
    error,  
  } = useGetCoachQuery();



  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-white">Loading coaches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-white">
          Error: {error?.data?.message || "An error occurred while loading coaches"}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coaches.map((coach) => (
        <Card key={coach._id} className="overflow-hidden text-white bg-[#0d111a] border-[#2a3142] hover:border-[#B4E90E] transition-colors duration-300">
          <CardHeader className="pb-3 pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-40 w-40 border-2 border-[#B4E90E]">
                <AvatarImage src={coach.image || coach.profilePic} alt={coach.name || `${coach.firstName}`} />
                <AvatarFallback className="bg-[#B4E90E] text-[#0d111a] text-xl font-bold">
                  {coach.firstName ? coach.firstName.charAt(0) : coach.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">
                  {coach.firstName ? `${coach.firstName}` : coach.name}
                </CardTitle>
                
                
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-4 space-y-4">
            {/* Specialties */}
            <div className="flex flex-wrap gap-2">
              {coach.specialties && coach.specialties.map((specialty, index) => (
                <Badge key={index} className="bg-transparent border border-[#B4E90E] text-[#B4E90E] hover:bg-[#B4E90E] hover:text-[#0d111a] transition-colors duration-300">
                  {specialty?.title?.en}
                </Badge>
              ))}
            </div>

            {/* About Content */}
            {coach.aboutContent?.paragraphs[locale]?.length > 0 && (
              <div className="space-y-2 text-gray-300">
                <h4 className="text-sm font-semibold text-[#B4E90E] mb-2">About {coach.firstName}</h4>
                {coach.aboutContent.paragraphs[locale]?.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-sm leading-relaxed">{paragraph}</p>
                ))}
              </div>
            )}



            {/* Certifications */}
            {coach.certifications?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#B4E90E] mb-2">Certifications:</h4>
                <div className="space-y-1">
                  {coach.certifications.map((cert, index) => (
                    <div key={index} className="text-xs text-gray-300 flex items-center gap-1">
                      <span className="text-white font-medium">{cert?.title?.[locale]}</span>
                      <span className="text-gray-400">- {cert.org}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 pb-6">
            <Button
              className="w-full bg-[#B4E90E] text-[#0d111a] hover:bg-[#a3d40c] font-semibold py-5 rounded-md shadow-lg shadow-[#B4E90E]/20 transition-all duration-300 hover:shadow-[#B4E90E]/30"
              onClick={() => onSelect(coach._id)}
            >
              {t("chooseCoach")}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}