package com.fincontrol.app

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.fincontrol.app.api.RetrofitClient
import com.fincontrol.app.api.SaldoInicialBody
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.NumberFormat
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private val scope = CoroutineScope(Dispatchers.Main)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val swipeRefresh = findViewById<androidx.swiperefreshlayout.widget.SwipeRefreshLayout>(R.id.swipeRefresh)
        swipeRefresh.setOnRefreshListener { carregarDados(swipeRefresh) }

        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnDefinirSaldo)
            .setOnClickListener { mostrarDialogoSaldoInicial() }

        carregarDados(null)
    }

    private fun carregarDados(swipe: androidx.swiperefreshlayout.widget.SwipeRefreshLayout?) {
        scope.launch {
            swipe?.isRefreshing = true
            try {
                val saldo = withContext(Dispatchers.IO) {
                    runCatching { RetrofitClient.api.getSaldo() }.getOrNull()
                }
                val dashboard = withContext(Dispatchers.IO) {
                    runCatching { RetrofitClient.api.getDashboard("mensal") }.getOrNull()
                }
                val vendas = withContext(Dispatchers.IO) {
                    runCatching { RetrofitClient.api.getVendas("total") }.getOrNull()
                }

                val tvSaldo = findViewById<android.widget.TextView>(R.id.tvSaldo)
                val tvLucro = findViewById<android.widget.TextView>(R.id.tvLucro)
                val tvDespesas = findViewById<android.widget.TextView>(R.id.tvDespesas)
                val tvVendas = findViewById<android.widget.TextView>(R.id.tvVendas)

                if (saldo?.isSuccessful == true) {
                    val body = saldo.body()!!
                    tvSaldo.text = formatarMoeda(body.saldo)
                    tvSaldo.setTextColor(
                        if (body.saldo >= 0) getColor(R.color.lucro)
                        else getColor(R.color.despesa)
                    )
                } else {
                    tvSaldo.text = "—"
                    Toast.makeText(this@MainActivity, R.string.erro_carregar, Toast.LENGTH_SHORT).show()
                }

                if (dashboard?.isSuccessful == true) {
                    val d = dashboard.body()!!
                    tvLucro.text = formatarMoeda(d.lucro_total)
                    tvDespesas.text = formatarMoeda(d.total_despesas)
                } else {
                    tvLucro.text = "—"
                    tvDespesas.text = "—"
                }

                if (vendas?.isSuccessful == true) {
                    val lista = vendas.body() ?: emptyList()
                    tvVendas.text = if (lista.isEmpty()) {
                        getString(R.string.ultimas_vendas) + ": nenhuma venda."
                    } else {
                        lista.take(10).joinToString("\n") { v ->
                            "${v.produto_nome ?: "Produto"} — ${formatarMoeda(v.valor_bruto)} (lucro ${formatarMoeda(v.lucro_com_taxa ?: 0.0)})"
                        }
                    }
                } else {
                    tvVendas.text = getString(R.string.erro_carregar)
                }
            } finally {
                swipe?.isRefreshing = false
            }
        }
    }

    private fun formatarMoeda(valor: Double): String {
        return NumberFormat.getCurrencyInstance(Locale("pt", "BR")).format(valor)
    }

    private fun mostrarDialogoSaldoInicial() {
        val input = TextInputEditText(this).apply {
            hint = "0,00"
            setPadding(48, 48, 48, 48)
        }
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.definir_saldo_inicial)
            .setView(input)
            .setPositiveButton(android.R.string.ok) { _, _ ->
                val texto = input.text?.toString()?.replace(",", ".") ?: ""
                val valor = texto.toDoubleOrNull() ?: 0.0
                if (valor >= 0) {
                    enviarSaldoInicial(valor)
                } else {
                    Toast.makeText(this, "Informe um valor válido.", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    private fun enviarSaldoInicial(valor: Double) {
        scope.launch {
            val res = withContext(Dispatchers.IO) {
                runCatching { RetrofitClient.api.postSaldoInicial(SaldoInicialBody(valor)) }.getOrNull()
            }
            if (res?.isSuccessful == true) {
                Toast.makeText(this@MainActivity, "Saldo inicial definido!", Toast.LENGTH_SHORT).show()
                carregarDados(null)
            } else {
                val msg = res?.errorBody()?.string() ?: "Erro ao salvar"
                Toast.makeText(this@MainActivity, msg, Toast.LENGTH_LONG).show()
            }
        }
    }
}
