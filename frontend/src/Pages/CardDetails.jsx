import React from 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AlertCircle, MapPin, Phone, Mail, MessageSquare, Check } from "lucide-react";



const CardDetails = () => {
  return (
    <div className='min-h-screen bg-gradient-subtle py-12'>

        <div className='container mx-auto px-4 max-w-6xl'>
             <Card className="mb-8 shadow-card">
              <CardHeader>
                <CardTitle>What happens when you press SOS?</CardTitle>
                <CardDescription>
                  Your emergency contacts will be notified immediately
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emergency/10">
                      <MapPin className="h-5 w-5 text-emergency" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Live Location Shared</h4>
                      <p className="text-sm text-muted-foreground">
                        Your exact GPS coordinates are sent to all emergency contacts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-medical/10">
                      <Phone className="h-5 w-5 text-medical" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">SMS Alert</h4>
                      <p className="text-sm text-muted-foreground">
                        Emergency message sent via SMS to all saved contacts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Mail className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email Notification</h4>
                      <p className="text-sm text-muted-foreground">
                        Detailed emergency email with your location and medical info
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <MessageSquare className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">WhatsApp Message</h4>
                      <p className="text-sm text-muted-foreground">
                        Instant WhatsApp alert with live location link
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>
                  Add trusted contacts who will be notified in emergencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="p-4 bg-muted rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">No emergency contacts added</p>
                      <p className="text-sm text-muted-foreground">Add contacts to enable SOS alerts</p>
                    </div>
                  </div>
                </div>
                <Button variant="medical" className="w-full bg-medical">
                  Add Emergency Contact
                </Button>
              </CardContent>
            </Card>
        </div>
      
    </div>
  )
}

export default CardDetails
