package lt.rasimas.phone_unlock_listener

import android.app.*
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.widget.Toast
import androidx.annotation.RequiresApi

class ForeverService : Service() {

    private var phoneUnlockedReceiver: PhoneUnlockedReceiver? = PhoneUnlockedReceiver()
    private var wakeLock: PowerManager.WakeLock? = null
    private var isServiceStarted = false

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startService(intent)
        return START_STICKY
    }

    override fun onDestroy() {
        if (phoneUnlockedReceiver != null) {
            unregisterReceiver(phoneUnlockedReceiver)
            phoneUnlockedReceiver = null
        }
        super.onDestroy()
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate() {
        super.onCreate()
        val notification = createNotification()
        startForeground(1, notification)
    }

    override fun startService(service: Intent?): ComponentName? {
        if (isServiceStarted) return null
        Toast.makeText(this, "Service starting its task", Toast.LENGTH_SHORT).show()
        isServiceStarted = true

        wakeLock = (getSystemService(Context.POWER_SERVICE) as PowerManager).run {
            newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ForeverService::lock").apply {
                acquire()
            }
        }

        if (phoneUnlockedReceiver == null) {
            phoneUnlockedReceiver = PhoneUnlockedReceiver()
        }

        registerReceiver(
            phoneUnlockedReceiver,
            IntentFilter("android.intent.action.USER_PRESENT")
        )

        return super.startService(service)
    }

    override fun stopService(name: Intent?): Boolean {
        try {
            wakeLock?.let {
                if (it.isHeld) {
                    it.release()
                }
            }
            stopForeground(true)
            stopSelf()

            if (phoneUnlockedReceiver != null) {
                unregisterReceiver(phoneUnlockedReceiver)
                phoneUnlockedReceiver = null
            }
        } catch (e: Exception) {
            println("Problems")
        }
        isServiceStarted = false
        return super.stopService(name)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun createNotification(): Notification {
        val notificationChannelId = "FOREVER SERVICE CHANNEL"

        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channel = NotificationChannel(
            notificationChannelId,
            "Forever service notifications channel",
            NotificationManager.IMPORTANCE_HIGH
        ).let {
            it.description = "Forever service channel"
            it.enableLights(true)
            it.lightColor = Color.RED
            it.enableVibration(true)
            it.vibrationPattern = longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400)
            it
        }
        notificationManager.createNotificationChannel(channel)

        val pendingIntent: PendingIntent =
            Intent(this, MainActivity::class.java).let { notificationIntent ->
                PendingIntent.getActivity(this, 0, notificationIntent, 0)
            }

        val builder: Notification.Builder = Notification.Builder(this, notificationChannelId)

        return builder
            .setContentTitle("Forever service")
            .setContentText("Hey, I'm waiting for unlocks!")
            .setContentIntent(pendingIntent)
            .setSmallIcon(R.drawable.ic_launcher)
            .build()
    }

}