package com.fincontrol.app

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.fincontrol.app.api.RetrofitClient
import com.fincontrol.app.api.VendaCreateBody
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RegistrarVendaActivity : AppCompatActivity() {

    private val scope = CoroutineScope(Dispatchers.Main)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_registrar_venda)

        val toolbar = findViewById<MaterialToolbar>(R.id.toolbarRegistrarVenda)
        toolbar.setNavigationOnClickListener { finish() }

        val inputProdutoId = findViewById<TextInputEditText>(R.id.inputProdutoId)
        val inputValorVenda = findViewById<TextInputEditText>(R.id.inputValorVenda)
        val inputTaxa = findViewById<TextInputEditText>(R.id.inputTaxa)
        val btnSalvar = findViewById<MaterialButton>(R.id.btnSalvarVenda)

        btnSalvar.setOnClickListener {
            val produtoId = inputProdutoId.text?.toString()?.toIntOrNull()
            val valor = inputValorVenda.text?.toString()?.replace(",", ".")?.toDoubleOrNull()
            val taxa = inputTaxa.text?.toString()?.replace(",", ".")?.toDoubleOrNull()

            if (produtoId == null || produtoId <= 0) {
                Toast.makeText(this, "Informe um ID de produto válido.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (valor == null || valor < 0) {
                Toast.makeText(this, "Informe um valor de venda válido.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            scope.launch {
                val res = withContext(Dispatchers.IO) {
                    runCatching {
                        RetrofitClient.api.postVenda(
                            VendaCreateBody(
                                produto_id = produtoId,
                                valor_bruto = valor,
                                taxa_percentual = taxa
                            )
                        )
                    }.getOrNull()
                }

                if (res?.isSuccessful == true) {
                    Toast.makeText(this@RegistrarVendaActivity, getString(R.string.sucesso_venda), Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    val msg = res?.errorBody()?.string() ?: "Erro ao registrar venda"
                    Toast.makeText(this@RegistrarVendaActivity, msg, Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}

