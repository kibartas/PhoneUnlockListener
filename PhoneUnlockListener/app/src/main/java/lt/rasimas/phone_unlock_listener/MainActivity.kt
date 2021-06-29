package lt.rasimas.phone_unlock_listener

import android.annotation.SuppressLint
import android.app.KeyguardManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.Switch
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.StringRequest
import com.android.volley.toolbox.Volley


class MainActivity : AppCompatActivity() {
    @RequiresApi(Build.VERSION_CODES.O)
    @SuppressLint("SetTextI18n", "UseSwitchCompatOrMaterialCode")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        startForegroundService(Intent(this, ForeverService::class.java))

        val switch: Switch = findViewById(R.id.switch1)

        switch.setOnCheckedChangeListener { buttonView, isChecked ->
            if (!isChecked) {
                stopService(Intent(this, ForeverService::class.java))
                switch.text = "Off"
            } else {
                startService(Intent(this, ForeverService::class.java))
                switch.text = "On"
            }
        }

        val resetButton: Button = findViewById(R.id.reset)
        resetButton.setOnClickListener {
            val queue = Volley.newRequestQueue(this)
            val url = "https://howmanytimeshaveiunlockedmyphonetoday.rasimas.lt/api/reset"

            val stringRequest = StringRequest(Request.Method.POST, url,
                { _ -> },
                { _ -> }
            )
            queue.add(stringRequest)
        }


        val getCurrentButton: Button = findViewById(R.id.button)
        val textView: TextView = findViewById(R.id.textView)
        getCurrentButton.setOnClickListener {
            val queue = Volley.newRequestQueue(this)
            val url = "https://howmanytimeshaveiunlockedmyphonetoday.rasimas.lt/api"

            val stringRequest = StringRequest(Request.Method.POST, url,
                { response ->
                    textView.text = response
                },
                Response.ErrorListener { textView.text = "Some kinda error happened!" }
            )
            queue.add(stringRequest)
        }
    }
}

class PhoneUnlockedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action != Intent.ACTION_USER_PRESENT) { return }
        val keyguardManager =
            context!!.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        if (!keyguardManager.isKeyguardLocked) {
            val queue = Volley.newRequestQueue(context)
            val url = "https://howmanytimeshaveiunlockedmyphonetoday.rasimas.lt/api/increase"

            val stringRequest = StringRequest(Request.Method.POST, url,
                { _ -> },
                { _ -> }
            )
            queue.add(stringRequest)
        }

    }
}