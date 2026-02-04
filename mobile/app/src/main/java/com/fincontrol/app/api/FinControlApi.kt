package com.fincontrol.app.api

import retrofit2.Response
import retrofit2.http.*

/**
 * API FinControl - mesma base do backend (Node/Express).
 * No emulador use baseUrl "http://10.0.2.2:3000/api/"
 * No dispositivo use o IP do seu PC, ex: "http://192.168.1.X:3000/api/"
 */
interface FinControlApi {

    @GET("saldo")
    suspend fun getSaldo(): Response<SaldoResponse>

    @POST("saldo/inicial")
    @Headers("Content-Type: application/json")
    suspend fun postSaldoInicial(@Body body: SaldoInicialBody): Response<SaldoInicialResponse>

    @GET("dashboard")
    suspend fun getDashboard(@Query("periodo") periodo: String = "mensal"): Response<DashboardResponse>

    @GET("vendas")
    suspend fun getVendas(@Query("periodo") periodo: String = "total"): Response<List<VendaResponse>>
}

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
