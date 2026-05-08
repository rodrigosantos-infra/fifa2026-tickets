import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trophy, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamFlag } from '@/components/TeamFlag';
import api, { type StandingRow } from '@/lib/api';

const Standings: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['standings'],
    queryFn: () => api.getStandings(),
  });

  useEffect(() => {
    if (isError) toast.error('Não foi possível carregar a tabela. Tente recarregar.');
  }, [isError]);

  const standings = data?.data?.standings || {};
  const groups = Object.keys(standings).sort();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header — pattern Groups.tsx */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Classificação por grupo</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl mb-4">
            <span className="gold-text">Tabela</span> da Copa 2026
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Os 2 primeiros de cada grupo avançam às oitavas. Atualizada conforme partidas são encerradas.
          </p>
        </div>

        {/* Grid de cards: 1 col mobile, 2 em md, 3 só em xl (1280+) — evita squeeze */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading
            ? [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)
            : groups.map((g) => (
                <Card
                  key={g}
                  className="rounded-2xl bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
                >
                  <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 border-b border-border py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-display text-lg text-primary">{g}</span>
                      </div>
                      <CardTitle className="font-display text-base">Grupo {g}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Tabela compacta com table-fixed: todas as colunas cabem sem rolagem.
                        Usa <table> nativa em vez do shadcn Table (padding default grande). */}
                    <table className="w-full text-xs table-fixed">
                      <thead className="bg-muted/30 text-muted-foreground">
                        <tr>
                          <th className="px-1 py-2 text-center font-medium" style={{ width: '8%' }}>#</th>
                          <th className="px-1 py-2 text-left font-medium" style={{ width: '20%' }}>Time</th>
                          <th className="px-0 py-2 text-center font-medium" style={{ width: '8%' }}>J</th>
                          <th className="px-0 py-2 text-center font-medium" style={{ width: '8%' }}>V</th>
                          <th className="px-0 py-2 text-center font-medium" style={{ width: '8%' }}>E</th>
                          <th className="px-0 py-2 text-center font-medium" style={{ width: '8%' }}>D</th>
                          <th className="px-0 py-2 text-center font-medium" style={{ width: '9%' }}>GP</th>
                          <th className="px-0 py-2 text-center font-medium" style={{ width: '9%' }}>GC</th>
                          <th className="px-0 py-2 text-center font-medium" style={{ width: '10%' }}>SG</th>
                          <th className="px-1 py-2 text-center font-bold text-foreground" style={{ width: '12%' }}>P</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings[g].map((row: StandingRow, idx) => (
                          <tr
                            key={row.team_id}
                            className={`border-t border-border ${idx < 2 ? 'bg-primary/5' : ''}`}
                          >
                            <td className="px-1 py-2 text-center font-medium">
                              {idx < 2 ? (
                                <Trophy className="w-3 h-3 text-gold inline" aria-label={`${idx + 1}º`} />
                              ) : (
                                idx + 1
                              )}
                            </td>
                            <td className="px-1 py-2 text-left">
                              <div className="flex items-center gap-1.5">
                                <TeamFlag flag={row.team_flag} name={row.team_name} size="sm" />
                                <span className="font-medium">{row.team_code}</span>
                              </div>
                            </td>
                            <td className="px-0 py-2 text-center">{row.played}</td>
                            <td className="px-0 py-2 text-center">{row.won}</td>
                            <td className="px-0 py-2 text-center">{row.drawn}</td>
                            <td className="px-0 py-2 text-center">{row.lost}</td>
                            <td className="px-0 py-2 text-center">{row.gf}</td>
                            <td className="px-0 py-2 text-center">{row.ga}</td>
                            <td className="px-0 py-2 text-center">
                              {row.gd >= 0 ? `+${row.gd}` : row.gd}
                            </td>
                            <td className="px-1 py-2 text-center font-bold">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Legenda */}
        <div className="mt-8 p-6 rounded-xl glass-card text-center text-sm text-muted-foreground">
          <strong className="text-foreground">Legenda:</strong> J = Jogos · V = Vitórias · E = Empates · D = Derrotas · GP = Gols Pró · GC = Gols Contra · SG = Saldo de Gols · P = Pontos
        </div>
      </div>
    </div>
  );
};

export default Standings;
