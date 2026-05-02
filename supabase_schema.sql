CREATE TABLE attendances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  colaborador text NOT NULL,
  data date NOT NULL,
  hora time NOT NULL,
  qtd integer DEFAULT 1,
  hora_faixa text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_attendances_colaborador ON attendances(colaborador);
CREATE INDEX idx_attendances_data ON attendances(data);
CREATE INDEX idx_attendances_hora_faixa ON attendances(hora_faixa);
