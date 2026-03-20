-- ===========================
-- BASE DE DADOS SISTEMA COTAÇÃO
-- ===========================

CREATE DATABASE IF NOT EXISTS sistema_cotacao
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE sistema_cotacao;

-- ===========================
-- UTILIZADORES / PERFIS
-- ===========================

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  apelido VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  admin TINYINT(1) NOT NULL DEFAULT 0, -- 1 = administrador (acesso total), 0 = utilizador normal
  imagem LONGTEXT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (Opcional) tabela de perfis, caso queiras mais níveis no futuro
CREATE TABLE IF NOT EXISTS perfis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,   -- 'admin', 'user'
  descricao VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuario_perfis (
  usuario_id INT NOT NULL,
  perfil_id INT NOT NULL,
  PRIMARY KEY (usuario_id, perfil_id),
  CONSTRAINT fk_usuario_perfis_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_usuario_perfis_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- COTAÇÕES
-- ===========================

CREATE TABLE IF NOT EXISTS cotacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(50) NOT NULL UNIQUE,         -- ex: COT-2026-0001
  cliente VARCHAR(150) NOT NULL,
  nif_cliente VARCHAR(50) NULL,
  email_cliente VARCHAR(150) NULL,
  telefone_cliente VARCHAR(50) NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  estado ENUM('pendente','aprovada','rejeitada') NOT NULL DEFAULT 'pendente',
  servico_principal VARCHAR(150) NULL,
  observacoes TEXT NULL,
  utilizador_id INT NULL,                     -- quem criou a cotação
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cotacoes_usuario FOREIGN KEY (utilizador_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cotacao_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cotacao_id INT NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(15,2) NOT NULL,
  taxa_imposto DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_linha DECIMAL(15,2) NOT NULL,
  CONSTRAINT fk_cotacao_itens_cotacao FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- FATURAS
-- ===========================

CREATE TABLE IF NOT EXISTS facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(50) NOT NULL UNIQUE,        -- ex: FAT-2026-0001
  cotacao_id INT NULL,                       -- fatura pode vir de uma cotação
  cliente VARCHAR(150) NOT NULL,
  nif_cliente VARCHAR(50) NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  estado ENUM('emitida','paga','cancelada') NOT NULL DEFAULT 'emitida',
  data_emissao DATE NOT NULL,
  data_vencimento DATE NULL,
  metodo_pagamento VARCHAR(50) NULL,
  utilizador_id INT NULL,                    -- quem emitiu
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_facturas_cotacao FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id),
  CONSTRAINT fk_facturas_usuario FOREIGN KEY (utilizador_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS factura_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  factura_id INT NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(15,2) NOT NULL,
  taxa_imposto DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_linha DECIMAL(15,2) NOT NULL,
  CONSTRAINT fk_factura_itens_factura FOREIGN KEY (factura_id) REFERENCES facturas(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- (Opcional) registo de pagamentos por fatura
CREATE TABLE IF NOT EXISTS pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  factura_id INT NOT NULL,
  valor_pago DECIMAL(15,2) NOT NULL,
  data_pagamento DATE NOT NULL,
  metodo_pagamento VARCHAR(50) NULL,
  referencia VARCHAR(100) NULL,
  CONSTRAINT fk_pagamentos_factura FOREIGN KEY (factura_id) REFERENCES facturas(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- MENSAGENS / SUPORTE
-- ===========================

CREATE TABLE IF NOT EXISTS mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_cliente VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  assunto VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  lida TINYINT(1) NOT NULL DEFAULT 0,
  utilizador_resposta_id INT NULL,
  resposta TEXT NULL,
  data_resposta TIMESTAMP NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mensagens_usuario FOREIGN KEY (utilizador_resposta_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- LOGS SIMPLES (OPCIONAL)
-- ===========================

CREATE TABLE IF NOT EXISTS logs_acesso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  ip VARCHAR(45) NULL,
  acao VARCHAR(100) NOT NULL,
  detalhes TEXT NULL,
  data_registo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- COMO USAR NO MYSQL WORKBENCH
-- ===========================
-- 1) Abrir uma nova aba "Query"
-- 2) Colar TODO este ficheiro
-- 3) Clicar em "Execute" (raio) para criar BD e tabelas


