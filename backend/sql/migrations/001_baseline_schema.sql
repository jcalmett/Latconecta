--
-- PostgreSQL database dump
--

\restrict Ngv3cgZNfh4UE5lZhHH740XlEai5MnwGDsoFPtqhj139RK1nXnINaHlHglkD5JK

-- Dumped from database version 14.20 (Ubuntu 14.20-1.pgdg24.04+1)
-- Dumped by pg_dump version 14.20 (Ubuntu 14.20-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: check_low_balance_vendors(numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_low_balance_vendors(threshold numeric DEFAULT 100.00) RETURNS TABLE(vendor_code character varying, vendor_name character varying, balance_currency character varying, balance_amount numeric, last_update timestamp without time zone, days_since_update integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.vendor_code,
        v.vendor_name,
        v.vendor_balance_currency,
        v.vendor_balance_amount,
        v.vendor_balance_last_update,
        CASE 
            WHEN v.vendor_balance_last_update IS NOT NULL 
            THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - v.vendor_balance_last_update))::INTEGER
            ELSE NULL
        END as days_since_update
    FROM vendors v
    WHERE v.vendor_status = 'active'
    AND (
        v.vendor_balance_amount < threshold
        OR v.vendor_balance_amount IS NULL
        OR v.vendor_balance_last_update IS NULL
        OR v.vendor_balance_last_update < CURRENT_TIMESTAMP - INTERVAL '24 hours'
    )
    ORDER BY v.vendor_balance_amount ASC NULLS FIRST;
END;
$$;


--
-- Name: FUNCTION check_low_balance_vendors(threshold numeric); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_low_balance_vendors(threshold numeric) IS 'Obtener vendors con saldo bajo o desactualizado';


--
-- Name: check_product_vendor_integrity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_product_vendor_integrity() RETURNS TABLE(product_id integer, product_code character varying, has_vendor_code boolean, has_vendpro_code boolean, has_vendpro_skuid boolean, vendor_exists boolean, vendor_product_exists boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.product_id,
        p.product_code,
        p.product_vendor_code IS NOT NULL as has_vendor_code,
        p.product_vendpro_code IS NOT NULL as has_vendpro_code,
        p.product_vendpro_skuid IS NOT NULL as has_vendpro_skuid,
        EXISTS(
            SELECT 1 FROM vendors v 
            WHERE v.vendor_code = p.product_vendor_code
        ) as vendor_exists,
        EXISTS(
            SELECT 1 FROM vendor_products vp 
            WHERE vp.vendor_code = p.product_vendor_code
            AND vp.vp_code = p.product_vendpro_code
            AND vp.vp_skuid = p.product_vendpro_skuid
        ) as vendor_product_exists
    FROM products p
    WHERE p.product_vendor_code IS NOT NULL
    ORDER BY p.product_id;
END;
$$;


--
-- Name: FUNCTION check_product_vendor_integrity(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_product_vendor_integrity() IS 'Verifica la integridad referencial entre products y vendor_products';


--
-- Name: generate_complaint_number(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_complaint_number(p_year integer) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN LPAD(nextval('seq_complaint_correlativo')::TEXT, 8, '0') || '-' || p_year::TEXT;
END;
$$;


--
-- Name: update_last_update_date(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_last_update_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.last_update_date = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_vendor_products_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_vendor_products_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_update_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: calendar_holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_holidays (
    id integer NOT NULL,
    fecha date NOT NULL,
    descripcion character varying(200) NOT NULL,
    pais character varying(5) DEFAULT 'PE'::character varying NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: calendar_holidays_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calendar_holidays_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calendar_holidays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.calendar_holidays_id_seq OWNED BY public.calendar_holidays.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    company_id integer NOT NULL,
    company_name character varying(50) NOT NULL,
    company_logo character varying(500),
    company_photo character varying(500),
    company_photo_mkt1 character varying(500),
    company_photo_mkt2 character varying(500),
    company_photo_mkt3 character varying(500),
    company_photo_mkt4 character varying(500),
    company_description5 character varying(500),
    company_lema_1 character varying(500),
    company_lema_2 character varying(500),
    company_status character varying(20) DEFAULT 'active'::character varying,
    created_by character varying(100),
    updated_by character varying(100),
    last_update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_usd_balance numeric(10,2) DEFAULT 0.00,
    company_usd_date_balance date,
    company_barcode_available character varying(2) DEFAULT 'No'::character varying,
    company_mail_customer_support character varying(255),
    country_id integer NOT NULL,
    service_id integer NOT NULL,
    company_mail_commercial_support character varying(255),
    company_local_currency character varying(3),
    company_local_balance numeric(12,2),
    company_local_date_balance timestamp without time zone,
    CONSTRAINT companies_company_barcode_available_check CHECK (((company_barcode_available)::text = ANY (ARRAY[('Si'::character varying)::text, ('No'::character varying)::text]))),
    CONSTRAINT companies_company_mail_customer_support_check CHECK ((((company_mail_customer_support)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text) OR (company_mail_customer_support IS NULL)))
);


--
-- Name: TABLE companies; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.companies IS 'Datos de la compaÃ±Ã­a Bitel';


--
-- Name: companies_company_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_company_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_company_id_seq OWNED BY public.companies.company_id;


--
-- Name: complaint_offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint_offers (
    id integer NOT NULL,
    complaint_id integer NOT NULL,
    numero_correlativo character varying(20) NOT NULL,
    oferta_texto text NOT NULL,
    enviada_at timestamp with time zone DEFAULT now() NOT NULL,
    enviada_por character varying(100),
    respuesta character varying(10),
    respuesta_at timestamp with time zone,
    observacion text,
    last_update_date timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_offer_respuesta CHECK ((((respuesta)::text = ANY ((ARRAY['ACEPTADA'::character varying, 'RECHAZADA'::character varying])::text[])) OR (respuesta IS NULL)))
);


--
-- Name: complaint_offers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.complaint_offers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: complaint_offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.complaint_offers_id_seq OWNED BY public.complaint_offers.id;


--
-- Name: complaint_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint_records (
    id integer NOT NULL,
    numero_correlativo character varying(20) NOT NULL,
    codigo_identificacion character varying(50) DEFAULT 'LATCOM-VIRTUAL-001'::character varying NOT NULL,
    fecha_registro timestamp with time zone DEFAULT now() NOT NULL,
    proveedor_razon_social character varying(200) NOT NULL,
    proveedor_ruc character varying(11) NOT NULL,
    proveedor_domicilio text NOT NULL,
    consumidor_nombre character varying(200) NOT NULL,
    consumidor_domicilio text,
    consumidor_tipo_doc character varying(5) DEFAULT 'DNI'::character varying NOT NULL,
    consumidor_nro_doc character varying(20) NOT NULL,
    consumidor_telefono character varying(20),
    consumidor_email character varying(200) NOT NULL,
    consumidor_menor_edad boolean DEFAULT false NOT NULL,
    representante_nombre character varying(200),
    representante_telefono character varying(20),
    representante_email character varying(200),
    bien_tipo character varying(10) NOT NULL,
    bien_descripcion text NOT NULL,
    bien_monto numeric(10,2) NOT NULL,
    tipo_reclamacion character varying(10) NOT NULL,
    detalle text NOT NULL,
    pedido_concreto text NOT NULL,
    canal_respuesta character varying(20) DEFAULT 'CORREO_ELECTRONICO'::character varying NOT NULL,
    direccion_correspondencia text,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    fecha_limite_respuesta date NOT NULL,
    respuesta_proveedor text,
    fecha_respuesta timestamp with time zone,
    responsable_interno character varying(200),
    oferta_texto text,
    oferta_enviada_at timestamp with time zone,
    oferta_respuesta character varying(10),
    oferta_respuesta_at timestamp with time zone,
    fecha_suspension_plazo date,
    dias_suspension integer DEFAULT 0,
    purchase_id integer,
    user_id integer,
    acuse_enviado boolean DEFAULT false NOT NULL,
    acuse_enviado_at timestamp with time zone,
    created_by character varying(100),
    updated_by character varying(100),
    last_update_date timestamp with time zone DEFAULT now() NOT NULL,
    doc1_url character varying(500),
    doc1_nombre character varying(200),
    doc2_url character varying(500),
    doc2_nombre character varying(200),
    CONSTRAINT ck_bien_tipo CHECK (((bien_tipo)::text = ANY ((ARRAY['PRODUCTO'::character varying, 'SERVICIO'::character varying])::text[]))),
    CONSTRAINT ck_canal_respuesta CHECK (((canal_respuesta)::text = ANY ((ARRAY['CORREO_ELECTRONICO'::character varying, 'CARTA'::character varying])::text[]))),
    CONSTRAINT ck_estado CHECK (((estado)::text = ANY ((ARRAY['PENDIENTE'::character varying, 'EN_PROCESO'::character varying, 'OFERTA_ENVIADA'::character varying, 'RESPONDIDO'::character varying, 'CERRADO'::character varying])::text[]))),
    CONSTRAINT ck_oferta_respuesta CHECK ((((oferta_respuesta)::text = ANY ((ARRAY['ACEPTADA'::character varying, 'RECHAZADA'::character varying])::text[])) OR (oferta_respuesta IS NULL))),
    CONSTRAINT ck_tipo_reclamacion CHECK (((tipo_reclamacion)::text = ANY ((ARRAY['RECLAMO'::character varying, 'QUEJA'::character varying])::text[])))
);


--
-- Name: complaint_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.complaint_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: complaint_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.complaint_records_id_seq OWNED BY public.complaint_records.id;


--
-- Name: countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.countries (
    country_id integer NOT NULL,
    country_code character varying(3) NOT NULL,
    country_name character varying(100) NOT NULL,
    country_flag_photo character varying(500),
    country_photo character varying(500),
    country_description character varying(500),
    status character varying(20) DEFAULT 'active'::character varying,
    created_by character varying(100),
    updated_by character varying(100),
    last_update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    country_er_usd numeric(10,6) DEFAULT 3.75,
    country_er_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: COLUMN countries.country_er_usd; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.countries.country_er_usd IS 'Tasa de cambio USD a PEN';


--
-- Name: COLUMN countries.country_er_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.countries.country_er_date IS 'Fecha de actualizaci¢n de tasa de cambio';


--
-- Name: countries_country_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.countries_country_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: countries_country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.countries_country_id_seq OWNED BY public.countries.country_id;


--
-- Name: latconecta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.latconecta (
    latconecta_id integer DEFAULT 1 NOT NULL,
    latconecta_name character varying(50) NOT NULL,
    latconecta_logo character varying(500),
    latconecta_photo character varying(500),
    latconecta_photo_mkt1 character varying(500),
    latconecta_photo_mkt2 character varying(500),
    latconecta_photo_mkt3 character varying(500),
    latconecta_photo_mkt4 character varying(500),
    latconecta_description character varying(500),
    latconecta_lema_1 character varying(500),
    latconecta_lema_2 character varying(500),
    latconecta_credit_balance numeric(12,2) DEFAULT 0.00,
    latconecta_date_balance date,
    latconecta_mail_support character varying(255),
    latconecta_mail_comercial character varying(255),
    latconecta_status character varying(20) DEFAULT 'active'::character varying,
    created_by character varying(100),
    updated_by character varying(100),
    last_update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    latconecta_web character varying(255),
    latconecta_facebook character varying(255),
    latconecta_instagram character varying(255),
    latconecta_twitter character varying(255),
    latconecta_linkedin character varying(255),
    latconecta_youtube character varying(255),
    latconecta_phone character varying(50),
    latconecta_address character varying(500),
    CONSTRAINT chk_latconecta_id CHECK ((latconecta_id = 1))
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    product_id integer NOT NULL,
    service_id integer NOT NULL,
    product_code character varying(50) NOT NULL,
    product_name character varying(100) NOT NULL,
    product_description character varying(500),
    product_photo character varying(500),
    product_currency character varying(10) NOT NULL,
    product_base_price numeric(10,2) NOT NULL,
    product_discount_percentage numeric(5,2) DEFAULT 0 NOT NULL,
    product_discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    product_fee numeric(10,2) DEFAULT 0 NOT NULL,
    product_total_price numeric(10,2) NOT NULL,
    product_vendor_code character varying(100),
    product_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_by character varying(100),
    updated_by character varying(100),
    last_update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    product_vendpro_code character varying(50) DEFAULT 'Vend001'::character varying NOT NULL,
    product_vendpro_skuid character varying(50) NOT NULL,
    country_id integer NOT NULL,
    company_id integer NOT NULL,
    product_base_price_max numeric(10,2),
    product_amount_type character varying(1) DEFAULT 'F'::character varying NOT NULL,
    product_discount_amount_max numeric(10,2) DEFAULT NULL::numeric,
    product_total_price_max numeric(10,2) DEFAULT NULL::numeric,
    CONSTRAINT chk_product_amount_type CHECK (((product_amount_type)::text = ANY (ARRAY[('F'::character varying)::text, ('R'::character varying)::text, ('V'::character varying)::text]))),
    CONSTRAINT chk_product_price_range CHECK (((((product_amount_type)::text = 'F'::text) AND (product_base_price_max IS NULL)) OR (((product_amount_type)::text = 'R'::text) AND (product_base_price_max IS NOT NULL) AND (product_base_price_max >= product_base_price)) OR ((product_amount_type)::text = 'V'::text)))
);


--
-- Name: TABLE products; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.products IS 'Productos disponibles para cada servicio';


--
-- Name: COLUMN products.product_base_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.product_base_price IS 'Precio base. Si type=F es precio Ãºnico, si type=R es mÃ­nimo, si type=V es referencia';


--
-- Name: COLUMN products.product_vendor_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.product_vendor_code IS 'CÃ³digo del vendor asociado (FK referencial a vendors.vendor_code)';


--
-- Name: COLUMN products.product_vendpro_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.product_vendpro_code IS 'CÃ³digo del producto en el vendor (referencia a vendor_products.vp_code)';


--
-- Name: COLUMN products.product_vendpro_skuid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.product_vendpro_skuid IS 'SKU del producto en el vendor (referencia a vendor_products.vp_skuid)';


--
-- Name: COLUMN products.product_base_price_max; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.product_base_price_max IS 'Precio mÃ¡ximo. Solo para type=R (Range). NULL para F y V';


--
-- Name: COLUMN products.product_amount_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.product_amount_type IS 'Tipo de monto del producto: F=Fixed (fijo), R=Range (rango), V=Variable';


--
-- Name: CONSTRAINT chk_product_amount_type ON products; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT chk_product_amount_type ON public.products IS 'Valida que product_amount_type sea F, R o V';


--
-- Name: CONSTRAINT chk_product_price_range ON products; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON CONSTRAINT chk_product_price_range ON public.products IS 'Valida rangos: (1) F sin max, (2) R con max >= min, (3) V flexible';


--
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchases (
    purchase_id integer NOT NULL,
    purchase_reference character varying(50) NOT NULL,
    purchase_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    purchase_user_id integer,
    purchase_phone_number character varying(15),
    purchase_product_id integer,
    purchase_service_name character varying(100) NOT NULL,
    purchase_product_name character varying(100) NOT NULL,
    purchase_base_price numeric(10,2) NOT NULL,
    purchase_discount numeric(12,2) DEFAULT 0 NOT NULL,
    purchase_fee numeric(12,2) DEFAULT 0 NOT NULL,
    purchase_total_amount numeric(10,2) NOT NULL,
    purchase_payment_method character varying(50) NOT NULL,
    purchase_payment_status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    purchase_credit_card_last_digits character varying(4),
    purchase_barcode_code character varying(50),
    purchase_barcode_image character varying(255),
    purchase_delivery_phone character varying(20),
    purchase_delivery_name character varying(50),
    purchase_delivery_address character varying(100),
    purchase_delivery_status character varying(100),
    purchase_receip_url character varying(255),
    purchase_vendor_code character varying(50),
    purchase_vendor_amount numeric(10,2),
    purchase_balance_currency character varying(10),
    purchase_initial_balance numeric(10,2),
    purchase_final_balance numeric(10,2),
    created_by character varying(100) DEFAULT 'System'::character varying NOT NULL,
    updated_by character varying(100) DEFAULT 'System'::character varying NOT NULL,
    last_update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    purchase_currency character varying(10) DEFAULT 'USD'::character varying,
    purchase_date_sent_to_conciliation timestamp without time zone,
    purchase_ip_petition character varying(50),
    purchase_vendor_json text,
    purchase_vendor_date_petition timestamp without time zone,
    purchase_vendor_date_response timestamp without time zone,
    purchase_vendor_response_code character varying(50),
    purchase_vendor_response_description character varying(255),
    purchase_vendor_purchase_id character varying(50),
    purchase_vendor_skuid character varying(50),
    purchase_vendor_currency character varying(10),
    purchase_exch_rate numeric(10,4),
    purchase_payment_ref character varying(255),
    purchase_provision_ref character varying(255),
    purchase_reversal_ref character varying(255),
    purchase_account_number character varying(100),
    requires_manual_intervention boolean DEFAULT false NOT NULL,
    purchase_product_type character varying(50),
    purchase_vendpro_code character varying(50),
    purchase_vendpro_country character varying(50),
    purchase_vendpro_operator character varying(50),
    vendor_name character varying(50),
    vendor_trans_id character varying(100),
    vendor_provider_trans_id character varying(100),
    vendor_request text,
    vendor_response text,
    purchase_vendor_cost numeric(10,2),
    purchase_status character varying(30),
    purchase_vendpro_amount_type character varying(20),
    purchase_vendpro_maximum_amount numeric(10,2),
    purchase_vendpro_product_type character(1)
);


--
-- Name: TABLE purchases; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.purchases IS 'Historial de transacciones de compra';


--
-- Name: COLUMN purchases.purchase_user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_user_id IS 'ID del usuario (NULL = compra an¢nima). Las compras an¢nimas se identifican por purchase_reference + purchase_phone_number';


--
-- Name: COLUMN purchases.purchase_currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_currency IS 'Moneda de la transacciÃ³n (USD, PEN, etc)';


--
-- Name: COLUMN purchases.purchase_date_sent_to_conciliation; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_date_sent_to_conciliation IS 'Fecha de envÃ­o para conciliaciÃ³n contable';


--
-- Name: COLUMN purchases.purchase_ip_petition; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_ip_petition IS 'DirecciÃ³n IP desde donde se realizÃ³ la peticiÃ³n';


--
-- Name: COLUMN purchases.purchase_vendor_json; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendor_json IS 'Respuesta JSON completa del proveedor (LATCOM)';


--
-- Name: COLUMN purchases.purchase_vendor_date_petition; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendor_date_petition IS 'Fecha/hora de peticiÃ³n al proveedor';


--
-- Name: COLUMN purchases.purchase_vendor_date_response; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendor_date_response IS 'Fecha/hora de respuesta del proveedor';


--
-- Name: COLUMN purchases.purchase_vendor_response_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendor_response_code IS 'CÃ³digo de respuesta del vendor: 1=Ã©xito, -XXXXX=error, TIMEOUT, NETWORK_ERROR';


--
-- Name: COLUMN purchases.purchase_vendor_response_description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendor_response_description IS 'DescripciÃ³n del cÃ³digo de respuesta del vendor';


--
-- Name: COLUMN purchases.purchase_vendor_purchase_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendor_purchase_id IS 'ID de compra asignado por el proveedor';


--
-- Name: COLUMN purchases.purchase_vendor_skuid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendor_skuid IS 'SKU ID del producto en sistema del proveedor';


--
-- Name: COLUMN purchases.purchase_vendor_currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendor_currency IS 'Moneda utilizada por el proveedor';


--
-- Name: COLUMN purchases.purchase_exch_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_exch_rate IS 'Tipo de cambio aplicado en la transacciÃ³n';


--
-- Name: COLUMN purchases.purchase_payment_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_payment_ref IS 'Referencia de pago de APICARD';


--
-- Name: COLUMN purchases.purchase_provision_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_provision_ref IS 'Referencia de provisiÃ³n';


--
-- Name: COLUMN purchases.purchase_reversal_ref; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_reversal_ref IS 'Referencia de reversiÃ³n';


--
-- Name: COLUMN purchases.purchase_account_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_account_number IS 'NÃºmero de cuenta para Bill Payments';


--
-- Name: COLUMN purchases.requires_manual_intervention; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.requires_manual_intervention IS 'TRUE si requiere intervenciÃ³n manual (pago OK + delivery FAIL + reverso FAIL)';


--
-- Name: COLUMN purchases.purchase_product_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_product_type IS 'Tipo: topup, bill_payment, transfer, smartphone';


--
-- Name: COLUMN purchases.purchase_vendpro_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendpro_code IS 'CÃ³digo del producto en VendPro (proveedor real)';


--
-- Name: COLUMN purchases.purchase_vendpro_country; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendpro_country IS 'PaÃ­s del operador en VendPro';


--
-- Name: COLUMN purchases.purchase_vendpro_operator; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendpro_operator IS 'Operador en VendPro (Movistar, Claro, Entel, etc)';


--
-- Name: COLUMN purchases.vendor_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.vendor_name IS 'Nombre del vendor usado (LATCOM, Vendor2, etc)';


--
-- Name: COLUMN purchases.vendor_trans_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.vendor_trans_id IS 'ID de transacciÃ³n generado por el vendor (ej: LT123456)';


--
-- Name: COLUMN purchases.vendor_provider_trans_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.vendor_provider_trans_id IS 'ID de transacciÃ³n del proveedor final/operador (ej: BITEL789)';


--
-- Name: COLUMN purchases.vendor_request; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.vendor_request IS 'Request JSON completo enviado al vendor (para auditorÃ­a)';


--
-- Name: COLUMN purchases.vendor_response; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.vendor_response IS 'Response JSON completo recibido del vendor (para auditorÃ­a)';


--
-- Name: COLUMN purchases.purchase_vendor_cost; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendor_cost IS 'Costo real del vendor. 
TopUps/Paquetes/Smartphones: vendor_products.vp_amount
Bill Payment/Transfers: purchase_base_price con conversi¢n por tipo de cambio si monedas difieren.';


--
-- Name: COLUMN purchases.purchase_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_status IS 'Estado de la transacci¢n de compra.
Valores: Success, Failed, Pending
Separado de purchase_delivery_status (que aplica solo para Smartphones: Ordered, In Transit, Delivered)';


--
-- Name: COLUMN purchases.purchase_vendpro_amount_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendpro_amount_type IS 'Tipo de monto del vendor product: Fixed (F), Range (R), Variable (V). Snapshot del campo vp_amount_type.';


--
-- Name: COLUMN purchases.purchase_vendpro_maximum_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendpro_maximum_amount IS 'Monto m ximo permitido para productos tipo Range o Variable. Snapshot del campo vp_maximum_amount.';


--
-- Name: COLUMN purchases.purchase_vendpro_product_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchases.purchase_vendpro_product_type IS 'Tipo de producto del vendor (snapshot - CHAR 1)';


--
-- Name: purchases_purchase_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchases_purchase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchases_purchase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchases_purchase_id_seq OWNED BY public.purchases.purchase_id;


--
-- Name: seq_complaint_correlativo; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_complaint_correlativo
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    service_id integer NOT NULL,
    service_name character varying(50) NOT NULL,
    service_photo character varying(500),
    service_photo_mkt character varying(500),
    service_description character varying(500),
    status character varying(20) DEFAULT 'active'::character varying,
    created_by character varying(100),
    updated_by character varying(100),
    last_update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE services; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.services IS 'Tipos de servicios ofrecidos (Top Ups, Paquetes, etc)';


--
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_service_id_seq OWNED BY public.services.service_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    user_photo character varying(500),
    user_name character varying(50) NOT NULL,
    user_email character varying(50) NOT NULL,
    user_password character varying(255) NOT NULL,
    user_phone_country_code character varying(50),
    user_phone_number character varying(50),
    user_role character varying(20) DEFAULT 'user'::character varying,
    user_status character varying(20) DEFAULT 'active'::character varying,
    user_session_token character varying(255),
    user_session_expiry timestamp without time zone,
    user_last_login_date timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100),
    last_update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.users IS 'Usuarios del sistema (clientes y administradores)';


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: v_companies_full; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_companies_full AS
 SELECT c.company_id,
    c.company_name,
    c.company_logo,
    c.company_status,
    c.company_usd_balance AS company_credit_balance,
    c.company_barcode_available,
    c.company_mail_customer_support,
    c.company_mail_commercial_support,
    co.country_id,
    co.country_code,
    co.country_name,
    s.service_id,
    s.service_name,
    c.created_by,
    c.updated_by,
    c.last_update_date
   FROM ((public.companies c
     JOIN public.countries co ON ((c.country_id = co.country_id)))
     JOIN public.services s ON ((c.service_id = s.service_id)));


--
-- Name: v_latconecta_info; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_latconecta_info AS
 SELECT latconecta.latconecta_id,
    latconecta.latconecta_name AS company_name,
    latconecta.latconecta_logo AS company_logo,
    latconecta.latconecta_credit_balance AS company_credit_balance,
    latconecta.latconecta_mail_support AS company_mail_customer_support,
    latconecta.latconecta_mail_comercial AS company_mail_commercial_support,
    latconecta.latconecta_status AS company_status,
    latconecta.last_update_date
   FROM public.latconecta
  WHERE (latconecta.latconecta_id = 1);


--
-- Name: v_products_full; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_products_full AS
 SELECT p.product_id,
    p.product_code,
    p.product_name,
    p.product_description,
    p.product_total_price,
    p.product_currency,
    p.product_status,
    p.product_photo,
    c.company_id,
    c.company_name,
    c.company_logo,
    co.country_id,
    co.country_code,
    co.country_name,
    s.service_id,
    s.service_name,
    s.service_photo,
    p.product_vendor_code,
    p.product_vendpro_code,
    p.product_vendpro_skuid,
    p.created_by,
    p.updated_by,
    p.last_update_date
   FROM (((public.products p
     JOIN public.companies c ON ((p.company_id = c.company_id)))
     JOIN public.countries co ON ((p.country_id = co.country_id)))
     JOIN public.services s ON ((p.service_id = s.service_id)));


--
-- Name: vendor_api_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_api_mappings (
    mapping_id integer NOT NULL,
    vendor_code character varying(50) NOT NULL,
    operation_type character varying(50) NOT NULL,
    http_method character varying(10) DEFAULT 'POST'::character varying,
    endpoint_url character varying(500),
    auth_type character varying(50),
    auth_config jsonb,
    request_mapping jsonb NOT NULL,
    value_transformations jsonb,
    response_mapping jsonb,
    success_indicators jsonb,
    timeout_seconds integer DEFAULT 30,
    headers jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    mapping_code character varying(5) NOT NULL,
    api_group_code character varying(50) NOT NULL
);


--
-- Name: COLUMN vendor_api_mappings.mapping_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_api_mappings.mapping_code IS 'CÃ³digo Ãºnico de 5 caracteres para identificar el mapping (ej: DTOP1)';


--
-- Name: vendor_api_mappings_mapping_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_api_mappings_mapping_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_api_mappings_mapping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_api_mappings_mapping_id_seq OWNED BY public.vendor_api_mappings.mapping_id;


--
-- Name: vendor_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_products (
    vp_id integer NOT NULL,
    vendor_code character varying(50) NOT NULL,
    vp_code character varying(100) NOT NULL,
    vp_skuid character varying(100),
    vp_name character varying(255),
    vp_description text,
    vp_operator character varying(50),
    vp_country character varying(50),
    vp_currency character varying(10),
    vp_amount numeric(10,2),
    vp_amount_type character varying(20),
    vp_minimum_amount numeric(10,2),
    vp_maximum_amount numeric(10,2),
    vp_service_type character varying(50),
    vp_commission numeric(10,2),
    vp_cost numeric(10,2),
    vp_status character varying(20) DEFAULT 'active'::character varying,
    vp_metadata jsonb,
    created_by character varying(100),
    updated_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    vp_fee_usd numeric(10,5) DEFAULT 0.00000 NOT NULL,
    api_group_code character varying(50),
    vp_product_type character(1),
    CONSTRAINT vendor_products_vp_status_check CHECK (((vp_status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: TABLE vendor_products; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.vendor_products IS 'CatÃ¡logo de productos disponibles en cada vendor';


--
-- Name: COLUMN vendor_products.vp_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_id IS 'ID Ãºnico del producto vendor (PK)';


--
-- Name: COLUMN vendor_products.vendor_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vendor_code IS 'CÃ³digo del vendor (FK a vendors)';


--
-- Name: COLUMN vendor_products.vp_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_code IS 'CÃ³digo del producto en el vendor (ej: BITEL_20_PEN)';


--
-- Name: COLUMN vendor_products.vp_skuid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_skuid IS 'SKU del producto en el vendor (ej: SKU_BITEL_20)';


--
-- Name: COLUMN vendor_products.vp_operator; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_operator IS 'Operador del servicio: bitel, claro, movistar, entel';


--
-- Name: COLUMN vendor_products.vp_country; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_country IS 'PaÃ­s del servicio: peru, mexico, colombia, etc';


--
-- Name: COLUMN vendor_products.vp_currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_currency IS 'Moneda del servicio: PEN, USD, MXN, etc';


--
-- Name: COLUMN vendor_products.vp_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_amount IS 'Monto del producto (fijo o mÃ­nimo si es rango)';


--
-- Name: COLUMN vendor_products.vp_amount_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_amount_type IS 'Tipo de monto: fixed (fijo), range (rango), variable';


--
-- Name: COLUMN vendor_products.vp_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_status IS 'Estado: active, inactive';


--
-- Name: COLUMN vendor_products.vp_product_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_products.vp_product_type IS 'Tipo de producto del vendor (CHAR 1)';


--
-- Name: vendor_products_vp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_products_vp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_products_vp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_products_vp_id_seq OWNED BY public.vendor_products.vp_id;


--
-- Name: vendor_sync_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_sync_logs (
    sync_id integer NOT NULL,
    vendor_code character varying(50) NOT NULL,
    api_group_code character varying(50) NOT NULL,
    sync_date timestamp without time zone DEFAULT now() NOT NULL,
    triggered_by character varying(100) DEFAULT 'scheduler'::character varying NOT NULL,
    status character varying(20) NOT NULL,
    products_reviewed integer DEFAULT 0 NOT NULL,
    products_updated integer DEFAULT 0 NOT NULL,
    error_message text,
    changes_detail jsonb,
    created_by character varying(100) DEFAULT 'System'::character varying NOT NULL,
    CONSTRAINT vendor_sync_logs_status_check CHECK (((status)::text = ANY ((ARRAY['success'::character varying, 'error'::character varying, 'no_changes'::character varying])::text[])))
);


--
-- Name: TABLE vendor_sync_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.vendor_sync_logs IS 'Historial de sincronizaciones de catálogo de productos por vendor';


--
-- Name: COLUMN vendor_sync_logs.triggered_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_sync_logs.triggered_by IS 'scheduler = automático | manual:email = disparado por admin';


--
-- Name: COLUMN vendor_sync_logs.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_sync_logs.status IS 'success = hubo cambios | no_changes = OK sin cambios | error = falló';


--
-- Name: COLUMN vendor_sync_logs.changes_detail; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendor_sync_logs.changes_detail IS 'JSON array con detalle de cada precio actualizado';


--
-- Name: vendor_sync_logs_sync_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_sync_logs_sync_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_sync_logs_sync_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_sync_logs_sync_id_seq OWNED BY public.vendor_sync_logs.sync_id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    vendor_code character varying(50) NOT NULL,
    vendor_name character varying(100) NOT NULL,
    vendor_display_name character varying(100),
    vendor_description text,
    vendor_url_uat character varying(255),
    vendor_url_prod character varying(255),
    vendor_username character varying(100),
    vendor_password character varying(255),
    vendor_api_key character varying(255),
    vendor_user_uid character varying(100),
    vendor_access_token text,
    vendor_token_expiry timestamp without time zone,
    vendor_local_currency character varying(10),
    vendor_usd_balance numeric(15,2),
    vendor_usd_date_balance timestamp without time zone,
    vendor_status character varying(20) DEFAULT 'active'::character varying,
    vendor_timeout integer DEFAULT 45,
    is_production boolean DEFAULT false,
    auto_sync_products boolean DEFAULT false,
    sync_interval_hours integer DEFAULT 24,
    last_sync_date timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    vendor_local_balance numeric(10,2),
    vendor_local_date_balance timestamp without time zone,
    sync_time character varying(5) DEFAULT '06:00'::character varying,
    CONSTRAINT vendors_vendor_status_check CHECK (((vendor_status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text])))
);


--
-- Name: TABLE vendors; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.vendors IS 'Maestro de vendors/proveedores de servicios (Latcom, Vendor2, etc) - VersiÃ³n 2 con balance';


--
-- Name: COLUMN vendors.vendor_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_code IS 'CÃ³digo Ãºnico del vendor (PK): LATCOM, VENDOR2, etc';


--
-- Name: COLUMN vendors.vendor_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_name IS 'Nombre tÃ©cnico del vendor';


--
-- Name: COLUMN vendors.vendor_display_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_display_name IS 'Nombre para mostrar en UI';


--
-- Name: COLUMN vendors.vendor_url_uat; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_url_uat IS 'URL del servicio UAT/Testing';


--
-- Name: COLUMN vendors.vendor_url_prod; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_url_prod IS 'URL del servicio ProducciÃ³n';


--
-- Name: COLUMN vendors.vendor_username; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_username IS 'Usuario para autenticaciÃ³n';


--
-- Name: COLUMN vendors.vendor_password; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_password IS 'Password cifrado para autenticaciÃ³n';


--
-- Name: COLUMN vendors.vendor_api_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_api_key IS 'API Key del vendor (dist_api en Latcom)';


--
-- Name: COLUMN vendors.vendor_user_uid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_user_uid IS 'User UID especÃ­fico del vendor';


--
-- Name: COLUMN vendors.vendor_access_token; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_access_token IS 'Token de acceso actual (se renueva automÃ¡ticamente)';


--
-- Name: COLUMN vendors.vendor_token_expiry; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_token_expiry IS 'Fecha/hora de expiraciÃ³n del token';


--
-- Name: COLUMN vendors.vendor_local_currency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_local_currency IS 'Moneda del balance del vendor: PEN, USD, MXN, etc';


--
-- Name: COLUMN vendors.vendor_usd_balance; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_usd_balance IS 'Saldo actual disponible en el vendor';


--
-- Name: COLUMN vendors.vendor_usd_date_balance; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_usd_date_balance IS 'Fecha y hora de la Ãºltima actualizaciÃ³n del balance';


--
-- Name: COLUMN vendors.vendor_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.vendor_status IS 'Estado del vendor: active, inactive';


--
-- Name: COLUMN vendors.is_production; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.is_production IS 'TRUE = usar vendor_url_prod, FALSE = usar vendor_url_uat';


--
-- Name: calendar_holidays id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_holidays ALTER COLUMN id SET DEFAULT nextval('public.calendar_holidays_id_seq'::regclass);


--
-- Name: companies company_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN company_id SET DEFAULT nextval('public.companies_company_id_seq'::regclass);


--
-- Name: complaint_offers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_offers ALTER COLUMN id SET DEFAULT nextval('public.complaint_offers_id_seq'::regclass);


--
-- Name: complaint_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_records ALTER COLUMN id SET DEFAULT nextval('public.complaint_records_id_seq'::regclass);


--
-- Name: countries country_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries ALTER COLUMN country_id SET DEFAULT nextval('public.countries_country_id_seq'::regclass);


--
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- Name: purchases purchase_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases ALTER COLUMN purchase_id SET DEFAULT nextval('public.purchases_purchase_id_seq'::regclass);


--
-- Name: services service_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN service_id SET DEFAULT nextval('public.services_service_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: vendor_api_mappings mapping_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_api_mappings ALTER COLUMN mapping_id SET DEFAULT nextval('public.vendor_api_mappings_mapping_id_seq'::regclass);


--
-- Name: vendor_products vp_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_products ALTER COLUMN vp_id SET DEFAULT nextval('public.vendor_products_vp_id_seq'::regclass);


--
-- Name: vendor_sync_logs sync_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_sync_logs ALTER COLUMN sync_id SET DEFAULT nextval('public.vendor_sync_logs_sync_id_seq'::regclass);


--
-- Name: calendar_holidays calendar_holidays_fecha_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_holidays
    ADD CONSTRAINT calendar_holidays_fecha_key UNIQUE (fecha);


--
-- Name: calendar_holidays calendar_holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_holidays
    ADD CONSTRAINT calendar_holidays_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (company_id);


--
-- Name: complaint_offers complaint_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_offers
    ADD CONSTRAINT complaint_offers_pkey PRIMARY KEY (id);


--
-- Name: complaint_records complaint_records_numero_correlativo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_records
    ADD CONSTRAINT complaint_records_numero_correlativo_key UNIQUE (numero_correlativo);


--
-- Name: complaint_records complaint_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_records
    ADD CONSTRAINT complaint_records_pkey PRIMARY KEY (id);


--
-- Name: countries countries_country_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_country_code_key UNIQUE (country_code);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (country_id);


--
-- Name: latconecta latconecta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.latconecta
    ADD CONSTRAINT latconecta_pkey PRIMARY KEY (latconecta_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: products products_product_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_product_code_key UNIQUE (product_code);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (purchase_id);


--
-- Name: purchases purchases_purchase_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_purchase_reference_key UNIQUE (purchase_reference);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- Name: vendor_api_mappings uq_vendor_group_operation; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_api_mappings
    ADD CONSTRAINT uq_vendor_group_operation UNIQUE (vendor_code, api_group_code, operation_type);


--
-- Name: vendor_products uq_vendor_product; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_products
    ADD CONSTRAINT uq_vendor_product UNIQUE (vendor_code, vp_code, vp_skuid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_email_key UNIQUE (user_email);


--
-- Name: vendor_api_mappings vendor_api_mappings_mapping_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_api_mappings
    ADD CONSTRAINT vendor_api_mappings_mapping_code_key UNIQUE (mapping_code);


--
-- Name: vendor_api_mappings vendor_api_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_api_mappings
    ADD CONSTRAINT vendor_api_mappings_pkey PRIMARY KEY (mapping_id);


--
-- Name: vendor_products vendor_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_products
    ADD CONSTRAINT vendor_products_pkey PRIMARY KEY (vp_id);


--
-- Name: vendor_sync_logs vendor_sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_sync_logs
    ADD CONSTRAINT vendor_sync_logs_pkey PRIMARY KEY (sync_id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (vendor_code);


--
-- Name: idx_api_mappings_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_mappings_group ON public.vendor_api_mappings USING btree (api_group_code);


--
-- Name: idx_co_complaint_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_co_complaint_id ON public.complaint_offers USING btree (complaint_id);


--
-- Name: idx_co_numero; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_co_numero ON public.complaint_offers USING btree (numero_correlativo);


--
-- Name: idx_companies_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_country ON public.companies USING btree (country_id);


--
-- Name: idx_companies_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_service ON public.companies USING btree (service_id);


--
-- Name: idx_cr_consumidor_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cr_consumidor_email ON public.complaint_records USING btree (consumidor_email);


--
-- Name: idx_cr_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cr_estado ON public.complaint_records USING btree (estado);


--
-- Name: idx_cr_fecha_limite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cr_fecha_limite ON public.complaint_records USING btree (fecha_limite_respuesta);


--
-- Name: idx_cr_fecha_registro; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cr_fecha_registro ON public.complaint_records USING btree (fecha_registro DESC);


--
-- Name: idx_cr_numero; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cr_numero ON public.complaint_records USING btree (numero_correlativo);


--
-- Name: idx_cr_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cr_user_id ON public.complaint_records USING btree (user_id);


--
-- Name: idx_products_amount_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_amount_type ON public.products USING btree (product_amount_type);


--
-- Name: idx_products_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_company ON public.products USING btree (company_id);


--
-- Name: idx_products_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_country ON public.products USING btree (country_id);


--
-- Name: idx_products_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_service ON public.products USING btree (service_id);


--
-- Name: idx_products_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_status ON public.products USING btree (product_status);


--
-- Name: idx_products_vendor_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_vendor_code ON public.products USING btree (product_vendor_code) WHERE (product_vendor_code IS NOT NULL);


--
-- Name: idx_products_vendor_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_vendor_product ON public.products USING btree (product_vendor_code, product_vendpro_code, product_vendpro_skuid) WHERE (product_vendor_code IS NOT NULL);


--
-- Name: idx_products_vendpro_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_vendpro_code ON public.products USING btree (product_vendpro_code);


--
-- Name: idx_purchases_anonymous; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_anonymous ON public.purchases USING btree (purchase_reference, purchase_phone_number) WHERE (purchase_user_id IS NULL);


--
-- Name: idx_purchases_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_date ON public.purchases USING btree (purchase_date);


--
-- Name: idx_purchases_manual_intervention; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_manual_intervention ON public.purchases USING btree (requires_manual_intervention);


--
-- Name: idx_purchases_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_payment_status ON public.purchases USING btree (purchase_payment_status);


--
-- Name: idx_purchases_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_phone ON public.purchases USING btree (purchase_phone_number);


--
-- Name: idx_purchases_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_product ON public.purchases USING btree (purchase_product_id);


--
-- Name: idx_purchases_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_reference ON public.purchases USING btree (purchase_reference);


--
-- Name: idx_purchases_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_status ON public.purchases USING btree (purchase_payment_status);


--
-- Name: idx_purchases_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_user ON public.purchases USING btree (purchase_user_id);


--
-- Name: idx_purchases_vendor_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_vendor_name ON public.purchases USING btree (vendor_name) WHERE (vendor_name IS NOT NULL);


--
-- Name: idx_purchases_vendor_purchase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_vendor_purchase_id ON public.purchases USING btree (purchase_vendor_purchase_id);


--
-- Name: idx_purchases_vendor_trans_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_vendor_trans_id ON public.purchases USING btree (vendor_trans_id) WHERE (vendor_trans_id IS NOT NULL);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (user_email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (user_role);


--
-- Name: idx_vendor_api_mappings_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_api_mappings_code ON public.vendor_api_mappings USING btree (mapping_code);


--
-- Name: idx_vendor_products_api_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_products_api_group ON public.vendor_products USING btree (api_group_code);


--
-- Name: idx_vendors_balance_update; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_balance_update ON public.vendors USING btree (vendor_usd_date_balance DESC);


--
-- Name: idx_vendors_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_status ON public.vendors USING btree (vendor_status);


--
-- Name: idx_vp_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vp_code ON public.vendor_products USING btree (vp_code);


--
-- Name: idx_vp_operator_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vp_operator_country ON public.vendor_products USING btree (vp_operator, vp_country);


--
-- Name: idx_vp_vendor_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vp_vendor_status ON public.vendor_products USING btree (vendor_code, vp_status);


--
-- Name: idx_vsl_sync_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vsl_sync_date ON public.vendor_sync_logs USING btree (sync_date DESC);


--
-- Name: idx_vsl_vendor_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vsl_vendor_code ON public.vendor_sync_logs USING btree (vendor_code);


--
-- Name: idx_vsl_vendor_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vsl_vendor_date ON public.vendor_sync_logs USING btree (vendor_code, sync_date DESC);


--
-- Name: complaint_offers trg_complaint_offers_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_complaint_offers_updated BEFORE UPDATE ON public.complaint_offers FOR EACH ROW EXECUTE FUNCTION public.update_last_update_date();


--
-- Name: complaint_records trg_complaint_records_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_complaint_records_updated BEFORE UPDATE ON public.complaint_records FOR EACH ROW EXECUTE FUNCTION public.update_last_update_date();


--
-- Name: vendor_products trg_vendor_products_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_vendor_products_update BEFORE UPDATE ON public.vendor_products FOR EACH ROW EXECUTE FUNCTION public.update_vendor_products_timestamp();


--
-- Name: complaint_offers complaint_offers_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_offers
    ADD CONSTRAINT complaint_offers_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaint_records(id) ON DELETE CASCADE;


--
-- Name: companies fk_companies_country; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_companies_country FOREIGN KEY (country_id) REFERENCES public.countries(country_id) ON DELETE RESTRICT;


--
-- Name: companies fk_companies_service; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_companies_service FOREIGN KEY (service_id) REFERENCES public.services(service_id) ON DELETE RESTRICT;


--
-- Name: products fk_products_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_company FOREIGN KEY (company_id) REFERENCES public.companies(company_id) ON DELETE RESTRICT;


--
-- Name: products fk_products_country; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_country FOREIGN KEY (country_id) REFERENCES public.countries(country_id) ON DELETE RESTRICT;


--
-- Name: purchases fk_purchases_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT fk_purchases_user FOREIGN KEY (purchase_user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: products products_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(service_id);


--
-- Name: purchases purchases_purchase_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_purchase_product_id_fkey FOREIGN KEY (purchase_product_id) REFERENCES public.products(product_id);


--
-- Name: vendor_api_mappings vendor_api_mappings_vendor_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_api_mappings
    ADD CONSTRAINT vendor_api_mappings_vendor_code_fkey FOREIGN KEY (vendor_code) REFERENCES public.vendors(vendor_code) ON DELETE CASCADE;


--
-- Name: vendor_products vendor_products_vendor_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_products
    ADD CONSTRAINT vendor_products_vendor_code_fkey FOREIGN KEY (vendor_code) REFERENCES public.vendors(vendor_code) ON DELETE CASCADE;


--
-- Name: vendor_sync_logs vendor_sync_logs_vendor_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_sync_logs
    ADD CONSTRAINT vendor_sync_logs_vendor_code_fkey FOREIGN KEY (vendor_code) REFERENCES public.vendors(vendor_code) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Ngv3cgZNfh4UE5lZhHH740XlEai5MnwGDsoFPtqhj139RK1nXnINaHlHglkD5JK

