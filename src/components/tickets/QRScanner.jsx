// src/components/tickets/QRScanner.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Keyboard,
  ScanLine,
  User,
  Ticket,
  Clock
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const QRScanner = ({ onScan, onValidate, eventId }) => {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        handleScanSuccess,
        handleScanError
      );
      
      setScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      setScanning(false);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    // Pause scanner while processing
    await stopScanner();
    setProcessing(true);

    try {
      const ticketData = JSON.parse(decodedText);
      const validationResult = await onValidate(ticketData.ticketCode);
      setResult(validationResult);
      
      if (validationResult.valid) {
        onScan?.(validationResult.ticket);
      }
    } catch (err) {
      setResult({
        valid: false,
        message: 'Invalid QR code format',
        status: 'invalid'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleScanError = (error) => {
    // Ignore scan errors (no QR found)
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setProcessing(true);
    try {
      const validationResult = await onValidate(manualCode.trim().toUpperCase());
      setResult(validationResult);
      
      if (validationResult.valid) {
        onScan?.(validationResult.ticket);
      }
    } catch (err) {
      setResult({
        valid: false,
        message: 'Error validating ticket',
        status: 'error'
      });
    } finally {
      setProcessing(false);
      setManualCode('');
    }
  };

  const handleCheckIn = async () => {
    if (result?.ticket) {
      setProcessing(true);
      try {
        await onScan(result.ticket, true); // true = confirm check-in
        setResult(null);
      } finally {
        setProcessing(false);
      }
    }
  };

  const resetScanner = () => {
    setResult(null);
    setManualCode('');
  };

  const resultConfig = {
    valid: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-500'
    },
    already_used: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      borderColor: 'border-yellow-500'
    },
    invalid: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-500'
    },
    wrong_event: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-500'
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-500'
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-500'
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan">
            <Camera className="w-4 h-4 mr-2" />
            Scan QR
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Keyboard className="w-4 h-4 mr-2" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div 
                id="qr-reader" 
                ref={scannerRef}
                className={cn(
                  "w-full max-w-sm mx-auto rounded-lg overflow-hidden",
                  !scanning && "hidden"
                )}
              />
              
              {!scanning && !result && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <ScanLine className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Click start to begin scanning tickets
                  </p>
                  <Button onClick={startScanner}>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Scanner
                  </Button>
                </div>
              )}

              {scanning && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={stopScanner}>
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Scanner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enter Ticket Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="TKT-XXXXXX-XXXX"
                  className="font-mono"
                />
                <Button type="submit" disabled={processing || !manualCode}>
                  {processing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Validate'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scan Result */}
      {result && (
        <Card className={cn(
          "border-2",
          resultConfig[result.status]?.borderColor
        )}>
          <CardContent className="pt-6">
            <div className={cn(
              "p-4 rounded-lg",
              resultConfig[result.status]?.bgColor
            )}>
              <div className="flex items-center gap-3 mb-4">
                {React.createElement(resultConfig[result.status]?.icon || XCircle, {
                  className: cn("w-8 h-8", resultConfig[result.status]?.color)
                })}
                <div>
                  <p className="font-semibold text-lg">
                    {result.valid ? 'Valid Ticket' : 'Invalid Ticket'}
                  </p>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
              </div>

              {result.ticket && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">{result.ticket.ticket_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{result.ticket.profiles?.full_name || 'Guest'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{result.ticket.ticket_type}</Badge>
                    {result.ticket.seat_number && (
                      <Badge variant="outline">Seat: {result.ticket.seat_number}</Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {result.valid && (
                  <Button 
                    className="flex-1" 
                    onClick={handleCheckIn}
                    disabled={processing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Check-in
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    resetScanner();
                    startScanner();
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Scan Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;