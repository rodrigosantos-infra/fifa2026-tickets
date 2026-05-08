import React, { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShieldCheck, AlertTriangle, Trophy, MapPin, Calendar, Clock, User, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DecodedTicket {
  id: string;
  h: string;   // home team
  a: string;   // away team
  s: string;   // stadium
  c: string;   // city
  d: string;   // date
  t: string;   // time
  sec: string; // sector
  q: number;   // quantity
  bn: string;  // buyer name
}

const TicketVerify: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const dataParam = searchParams.get('d');

  const decoded: DecodedTicket | null = useMemo(() => {
    if (!dataParam) return null;
    try {
      const json = decodeURIComponent(escape(atob(dataParam)));
      return JSON.parse(json) as DecodedTicket;
    } catch {
      return null;
    }
  }, [dataParam]);

  // Hash determinístico do ID para mostrar um "checksum visual" — apenas
  // efeito decorativo, comum em sistemas de validação reais.
  const checksum = useMemo(() => {
    if (!id) return '';
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h).toString(16).slice(0, 8).toUpperCase().padStart(8, '0');
  }, [id]);

  const verifiedAt = format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl mb-2">Código inválido</h1>
          <p className="text-muted-foreground mb-6">
            Este QR code não corresponde a um ingresso válido.
          </p>
          <Link to="/">
            <Button>Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status Card — verde, grande, central */}
        <div className="rounded-2xl bg-gradient-to-br from-green-500/15 via-green-500/5 to-emerald-500/10 border-2 border-green-500/30 p-8 text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl mb-2">
            Ingresso <span className="text-green-600 dark:text-green-400">Validado</span>
          </h1>
          <p className="text-muted-foreground">
            Este ingresso é autêntico e foi verificado em{' '}
            <span className="font-medium text-foreground">{verifiedAt}</span>
          </p>
        </div>

        {/* Ticket Info */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {/* Header com brand */}
          <div className="bg-gradient-to-r from-[#7B0F1A] to-[#1a0810] text-white p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8941F] flex items-center justify-center">
                <Trophy className="w-5 h-5" color="#1a0810" />
              </div>
              <div>
                <div className="text-xs opacity-70 tracking-widest">COPA DO MUNDO</div>
                <div className="font-display text-xl">FIFA 2026™</div>
              </div>
            </div>
          </div>

          {/* Detalhes */}
          {decoded ? (
            <div className="p-6 space-y-5">
              {/* Confronto */}
              <div className="text-center py-4 border-y border-border">
                <div className="text-xs text-muted-foreground tracking-wider mb-2">
                  CONFRONTO
                </div>
                <div className="font-display text-2xl">
                  {decoded.h}{' '}
                  <span className="text-primary mx-2">×</span>
                  {decoded.a}
                </div>
              </div>

              {/* Grid de dados */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Data</div>
                    <div className="font-medium">
                      {decoded.d
                        ? format(new Date(decoded.d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Horário</div>
                    <div className="font-medium">{decoded.t}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 col-span-2">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Estádio</div>
                    <div className="font-medium">{decoded.s}</div>
                    <div className="text-sm text-muted-foreground">{decoded.c}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Setor</div>
                    <div className="font-medium">{decoded.sec}</div>
                    <div className="text-sm text-muted-foreground">
                      {decoded.q} ingresso{decoded.q > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Titular</div>
                    <div className="font-medium">{decoded.bn}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              Os detalhes deste ingresso não foram embutidos no QR. Verifique direto no
              sistema com o ID abaixo.
            </div>
          )}

          {/* Footer com ID + checksum */}
          <div className="bg-muted/30 px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="text-muted-foreground tracking-wider">ID DO INGRESSO</div>
                <div className="font-mono font-bold text-sm mt-0.5">{id}</div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground tracking-wider">CHECKSUM</div>
                <div className="font-mono font-bold text-sm mt-0.5 text-primary">
                  {checksum}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aviso */}
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-amber-600 dark:text-amber-400">Aviso educacional:</strong>
              {' '}Esta aplicação é fictícia, parte do evento{' '}
              <strong>TFTEC Copa do Mundo Azure</strong>. Os ingressos não são válidos
              para acesso a eventos reais. Apresente seu documento na entrada se for
              um cenário real.
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/">
            <Button variant="outline">Voltar ao site</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TicketVerify;
