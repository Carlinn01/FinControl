package com.fincontrol.app.api

import retrofit2.Response
import retrofit2.http.*

/**
 * API FinControl - mesma base do backend (Node/Express).
 * No emulador use baseUrl "http://10.0.2.2:3000/api/"
 * No dispositivo use o IP do seu PC, ex: "http://192.168.1.X:3000/api/"
 */
interface FinControlApi {

    // Saldo
    @GET("saldo")
    suspend fun getSaldo(): Response<SaldoResponse>

    @POST("saldo/inicial")
    @Headers("Content-Type: application/json")
    suspend fun postSaldoInicial(@Body body: SaldoInicialBody): Response<SaldoInicialResponse>

    // Dashboard
    @GET("dashboard")
    suspend fun getDashboard(@Query("periodo") periodo: String = "mensal"): Response<DashboardResponse>

    // Vendas
    @GET("vendas")
    suspend fun getVendas(@Query("periodo") periodo: String = "total"): Response<List<VendaResponse>>

    @POST("vendas")
    @Headers("Content-Type: application/json")
    suspend fun postVenda(@Body body: VendaCreateBody): Response<VendaCreateResponse>

    // Despesas
    @POST("despesas")
    @Headers("Content-Type: application/json")
    suspend fun postDespesa(@Body body: DespesaCreateBody): Response<DespesaCreateResponse>

    // Produtos (para exibir IDs/nome em futuras melhorias)
    @GET("produtos")
    suspend fun getProdutos(): Response<List<ProdutoResponse>>

    // Metas
    @GET("metas")
    suspend fun getMetas(): Response<List<MetaResponse>>

    @POST("metas")
    @Headers("Content-Type: application/json")
    suspend fun postMeta(@Body body: MetaCreateBody): Response<MetaCreateResponse>

    @GET("metas/{id}/progresso")
    suspend fun getMetaProgresso(@Path("id") id: Int): Response<MetaProgressoResponse>
}

// --- Models existentes ---

data class SaldoResponse(
    val saldo: Double,
    val saldo_inicial: Double,
    val lucro_liquido_vendas: Double,
    val total_despesas: Double
)

data class SaldoInicialBody(val valor: Double)
data class SaldoInicialResponse(val id: Int, val valor: Double, val message: String)

data class DashboardResponse(
    val periodo: String,
    val saldo: Double,
    val lucro_total: Double,
    val total_despesas: Double,
    val total_taxas: Double
)

data class VendaResponse(
    val id: Int,
    val produto_id: Int,
    val valor_bruto: Double,
    val produto_nome: String?,
    val lucro_com_taxa: Double?,
    val created_at: String?
)

data class ApiError(val error: String?)

// --- Novos models para criação de vendas/despesas/produtos/metas ---

data class VendaCreateBody(
    val produto_id: Int,
    val valor_bruto: Double,
    val taxa_percentual: Double? = null
)

data class VendaCreateResponse(
    val id: Int,
    val produto_id: Int,
    val valor_bruto: Double,
    val taxa_percentual: Double,
    val lucro_sem_taxa: Double,
    val lucro_com_taxa: Double,
    val valor_taxa: Double,
    val message: String?
)

data class DespesaCreateBody(
    val nome: String,
    val motivo: String? = null,
    val valor: Double,
    val data: String? = null // YYYY-MM-DD ou null para hoje
)

data class DespesaCreateResponse(
    val id: Int,
    val nome: String,
    val motivo: String?,
    val valor: Double,
    val data: String,
    val message: String?
)

data class ProdutoResponse(
    val id: Int,
    val nome: String,
    val custo: Double,
    val valor_sugerido: Double,
    val created_at: String?
)

data class MetaResponse(
    val id: Int,
    val descricao: String,
    val valor_alvo: Double,
    val periodo: String,
    val created_at: String?
)

data class MetaCreateBody(
    val descricao: String,
    val valor_alvo: Double,
    val periodo: String // "mensal" ou "anual"
)

data class MetaCreateResponse(
    val id: Int,
    val descricao: String,
    val valor_alvo: Double,
    val periodo: String,
    val message: String?
)

data class MetaProgressoResponse(
    val meta_id: Int,
    val descricao: String,
    val valor_alvo: Double,
    val valor_atual: Double,
    val percentual: Double,
    val falta: Double,
    val periodo: String
)
