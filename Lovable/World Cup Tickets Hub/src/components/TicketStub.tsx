import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { Trophy, MapPin, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

export interface TicketData {
  ticketId: string;
  matchId: string | number;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  stadium: string;
  city: string;
  date: string;
  time: string;
  sector: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  purchaseDate: Date;
}

interface TicketStubProps {
  ticket: TicketData;
  innerRef?: (el: HTMLDivElement | null) => void;
  /** URL base do site (sem barra final) — para construir o link do QR. */
  siteOrigin?: string;
}

/**
 * Constroi a URL de verificação do QR code.
 * Embuti os dados essenciais em base64 para a página /ticket/verify
 * funcionar offline (sem consulta ao DB).
 */
function buildVerifyUrl(ticket: TicketData, siteOrigin: string): string {
  const compact = {
    id: ticket.ticketId,
    h: ticket.homeTeam,
    a: ticket.awayTeam,
    s: ticket.stadium,
    c: ticket.city,
    d: ticket.date,
    t: ticket.time,
    sec: ticket.sector,
    q: ticket.quantity,
    bn: ticket.buyerName,
  };
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(compact))));
  return `${siteOrigin}/ticket/verify/${ticket.ticketId}?d=${payload}`;
}

const FIFA_RED = '#7B0F1A';
const FIFA_GOLD = '#D4AF37';

export const TicketStub: React.FC<TicketStubProps> = ({
  ticket,
  innerRef,
  siteOrigin = typeof window !== 'undefined' ? window.location.origin : '',
}) => {
  const qrUrl = buildVerifyUrl(ticket, siteOrigin);
  const formattedDate = format(new Date(ticket.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const purchaseDateFormatted = format(ticket.purchaseDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <div
      ref={innerRef}
      className="bg-white text-black"
      style={{
        width: 1000,
        height: 380,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        display: 'flex',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* === CORPO PRINCIPAL === */}
      <div
        style={{
          flex: 1,
          background: `linear-gradient(135deg, #1a0810 0%, ${FIFA_RED} 60%, #1a0810 100%)`,
          color: 'white',
          padding: '24px 32px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Pattern de fundo decorativo (linhas do gramado) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 60px, white 60px 61px)',
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${FIFA_GOLD} 0%, #B8941F 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
              }}
            >
              <Trophy size={24} color="#1a0810" strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 3,
                  color: FIFA_GOLD,
                  fontWeight: 600,
                }}
              >
                COPA DO MUNDO
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 1,
                  lineHeight: 1,
                }}
              >
                FIFA 2026™
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: 2 }}>OFFICIAL MATCH TICKET</div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: FIFA_GOLD,
                letterSpacing: 1,
                marginTop: 2,
              }}
            >
              CANADÁ · MÉXICO · EUA
            </div>
          </div>
        </div>

        {/* Match — times com bandeiras */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            margin: '8px 0',
          }}
        >
          <div style={{ textAlign: 'center', flex: 1 }}>
            {ticket.homeFlag?.startsWith('http') ? (
              <img
                src={ticket.homeFlag}
                alt={ticket.homeTeam}
                crossOrigin="anonymous"
                style={{
                  width: 64,
                  height: 44,
                  objectFit: 'cover',
                  borderRadius: 4,
                  border: `2px solid ${FIFA_GOLD}`,
                  margin: '0 auto',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              />
            ) : (
              <div style={{ fontSize: 40, lineHeight: 1 }}>{ticket.homeFlag || '🏆'}</div>
            )}
            <div
              style={{
                marginTop: 8,
                fontSize: 18,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {ticket.homeTeam}
            </div>
          </div>

          <div style={{ textAlign: 'center', flex: 0 }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: FIFA_GOLD,
                fontStyle: 'italic',
                lineHeight: 1,
              }}
            >
              VS
            </div>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            {ticket.awayFlag?.startsWith('http') ? (
              <img
                src={ticket.awayFlag}
                alt={ticket.awayTeam}
                crossOrigin="anonymous"
                style={{
                  width: 64,
                  height: 44,
                  objectFit: 'cover',
                  borderRadius: 4,
                  border: `2px solid ${FIFA_GOLD}`,
                  margin: '0 auto',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              />
            ) : (
              <div style={{ fontSize: 40, lineHeight: 1 }}>{ticket.awayFlag || '🏆'}</div>
            )}
            <div
              style={{
                marginTop: 8,
                fontSize: 18,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {ticket.awayTeam}
            </div>
          </div>
        </div>

        {/* Match details — grid 4 cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            background: 'rgba(0,0,0,0.25)',
            padding: '12px 16px',
            borderRadius: 8,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.7, fontSize: 9, letterSpacing: 1 }}>
              <Calendar size={11} /> DATA
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3, lineHeight: 1.2 }}>
              {formattedDate}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.7, fontSize: 9, letterSpacing: 1 }}>
              <Clock size={11} /> HORÁRIO
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 3, color: FIFA_GOLD }}>
              {ticket.time}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.7, fontSize: 9, letterSpacing: 1 }}>
              <MapPin size={11} /> ESTÁDIO
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3, lineHeight: 1.2 }}>
              {ticket.stadium}
              <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{ticket.city}</div>
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7, fontSize: 9, letterSpacing: 1 }}>SETOR</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 3, color: FIFA_GOLD }}>
              {ticket.sector}
            </div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>
              {ticket.quantity} ingresso{ticket.quantity > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Footer — buyer + ticket id */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: 6,
            borderTop: '1px dashed rgba(255,255,255,0.2)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, opacity: 0.7, letterSpacing: 1 }}>
              <User size={11} /> TITULAR
            </div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{ticket.buyerName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: 1 }}>EMITIDO EM</div>
            <div style={{ fontSize: 10, fontWeight: 600 }}>{purchaseDateFormatted}</div>
          </div>
        </div>
      </div>

      {/* === STUB DIREITO (perfuração) === */}
      <div
        style={{
          width: 240,
          background: 'white',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          borderLeft: '3px dashed #ccc',
        }}
      >
        {/* Círculos das perfurações topo/baixo (efeito ingresso real) */}
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: -10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#0a0a0a',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -10,
            bottom: -10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#0a0a0a',
          }}
        />

        <div style={{ textAlign: 'center', width: '100%' }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              color: FIFA_RED,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            ESCANEIE PARA VALIDAR
          </div>
          <div
            style={{
              padding: 8,
              background: 'white',
              border: `2px solid ${FIFA_RED}`,
              borderRadius: 6,
              display: 'inline-block',
            }}
          >
            <QRCodeSVG
              value={qrUrl}
              size={140}
              level="M"
              fgColor={FIFA_RED}
              bgColor="white"
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', width: '100%', marginTop: 8 }}>
          <div
            style={{
              fontSize: 8,
              color: '#666',
              letterSpacing: 2,
              fontWeight: 600,
              marginBottom: 2,
            }}
          >
            ID DO INGRESSO
          </div>
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: 12,
              fontWeight: 700,
              color: '#1a0810',
              letterSpacing: 0.5,
              wordBreak: 'break-all',
            }}
          >
            {ticket.ticketId}
          </div>
          <div
            style={{
              marginTop: 10,
              padding: '4px 10px',
              background: FIFA_RED,
              color: 'white',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              borderRadius: 4,
            }}
          >
            <ShieldCheck size={12} /> AUTENTICADO
          </div>
        </div>
      </div>
    </div>
  );
};
