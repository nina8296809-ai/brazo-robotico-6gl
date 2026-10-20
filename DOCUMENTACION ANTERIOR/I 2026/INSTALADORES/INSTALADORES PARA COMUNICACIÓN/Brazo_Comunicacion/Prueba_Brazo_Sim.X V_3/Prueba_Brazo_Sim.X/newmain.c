/*
 * Brazo 6GDL_ Comunicacion con la PC
 * PIC16F1946
 * HI-TECH C 9.83
 */
#include <pic.h>
#define uchar unsigned char
#define uint unsigned int

__CONFIG(0x3CE1);

#define _XTAL_FREQ 4000000

// entradas
#define kzx     RA0
#define kyx     RA1
#define kss1    RA2
#define kxj1    RA3
#define kss2    RA4
#define kxj2    RA5

#define kss3    RB1
#define kxj3    RB2
#define kszzx   RB3
#define kszyx   RB4
#define kzj     RB5

#define kfs     RC0
#define kaut    RC1
#define kreset  RC3
#define kstart  RC4
#define kstop   RC5
//sensores
#define s1      RD0     
#define s2      RD1    
#define s3      RD2     
#define s4      RD3     
#define s5      RD4     
#define s6      RD5    
#define s7      RD6    
//salidas
#define zx      RE0
#define yx      RE1
#define xj1     RE2
#define ss1     RE3
#define ss2     RE4
#define xj2     RE5
#define ss3     RE6

#define xj3     RF0
#define szzx    RF1
#define szyx    RF2
#define fs      RF3
#define zj      RF4
//variables globales
unsigned char pc_zx=0;
unsigned char pc_yx=0;

unsigned char pc_ss1=0;
unsigned char pc_xj1=0;

unsigned char pc_ss2=0;
unsigned char pc_xj2=0;

unsigned char pc_ss3=0;
unsigned char pc_xj3=0;

unsigned char pc_szzx=0;
unsigned char pc_szyx=0;

unsigned char pc_zj=0;
unsigned char pc_fs=0;
//--------------------------------------------------
// UART
//--------------------------------------------------
void UART2_Write(char dato)
{
    while(!TX2IF);
    TX2REG = dato;
}

void UART2_Text(const char *txt)
{
    while(*txt)
    {
        UART2_Write(*txt++);
    }
}

void UART2_Init(void)
{
    ANSELG = 0x00;

    TRISG1 = 0;      // TX2
    TRISG2 = 1;      // RX2

    TX2STAbits.SYNC = 0;
    TX2STAbits.TX9  = 0;
    TX2STAbits.BRGH = 1;

    BAUD2CONbits.BRG16 = 0;

    SP2BRGH = 0;
    SP2BRGL = 103;      // 25

    RC2STAbits.SPEN = 1;
    RC2STAbits.CREN = 1;

    TX2STAbits.TXEN = 1;
}
//--------------------------------------------------
// PWM 
//--------------------------------------------------
void PWM_init(void)
{
    PR2 = 50;
    CCP1CON = 0x0F;
    CCPR1L = 25;
    CCPTMRS0 = 0x00;
    T2CON = 0x07;
    TRISC2 = 0;

    PR4 = 50;
    CCP2CON = 0x0F;
    CCPR2L = 25;
    CCPTMRS0 = 0x04;
    T4CON = 0x07;
    APFCON = 0x04;
    TRISE7 = 0;
}
//--------------------------------------------------
// PUERTOS
//--------------------------------------------------
void IO_init(void)
{
    ANSELA = 0x00;
    ANSELE = 0x00;
    ANSELF = 0x00;
    ANSELG = 0x00;

    TRISA = 0xFF;
    TRISB = 0xFF;
    TRISD = 0xFF;

    TRISC0 = 1;
    TRISC1 = 1;
    TRISC3 = 1;
    TRISC4 = 1;
    TRISC5 = 1;

    TRISE = 0x00;
    TRISF = 0x00;

    PORTE = 0x00;
    PORTF = 0x00;
}
//--------------------------------------------------
// CONTROL DESDE PC
//--------------------------------------------------
void PC_Control(void)
{
    char cmd;

    if(RC2STAbits.OERR)
    {
        RC2STAbits.CREN = 0;
        RC2STAbits.CREN = 1;
    }

    if(RC2IF)
    {
        cmd = RC2REG;

        switch(cmd)
        {
        case 'A': pc_zx=1; break;
        case 'a': pc_zx=0; break;
        case 'B': pc_yx=1; break;
        case 'b': pc_yx=0; break;
        case 'C': pc_ss1=1; break;
        case 'c': pc_ss1=0; break;
        case 'D': pc_xj1=1; break;
        case 'd': pc_xj1=0; break;
        case 'E': pc_ss2=1; break;
        case 'e': pc_ss2=0; break;
        case 'F': pc_xj2=1; break;
        case 'f': pc_xj2=0; break;
        case 'G': pc_ss3=1; break;
        case 'g': pc_ss3=0; break;
        case 'H': pc_xj3=1; break;
        case 'h': pc_xj3=0; break;
        case 'I': pc_szzx=1; break;
        case 'i': pc_szzx=0; break;
        case 'J': pc_szyx=1; break;
        case 'j': pc_szyx=0; break;
        case 'K': pc_zj=1; break;
        case 'k': pc_zj=0; break;
        case 'L': pc_fs=1; break;
        case 'l': pc_fs=0; break;
        case 'S':
                  pc_zx=0;
                  pc_yx=0;
                  pc_ss1=0;
                  pc_xj1=0;
                  pc_ss2=0;
                  pc_xj2=0;
                  pc_ss3=0;
                  pc_xj3=0; 
                  pc_szzx=0;
                  pc_szyx=0;
                  pc_zj=0;
                  pc_fs=0;
    PORTE=0;
    PORTF=0;
    break;
        }
    }
}

void Manual_Control(void)
{
    zx   = ((kzx==0)   || pc_zx) && (s1==0);
    yx   = ((kyx==0)   || pc_yx) && (s1==0);

    ss1  = ((kss1==0)  || pc_ss1) && (s2==0);
    xj1  = ((kxj1==0)  || pc_xj1) && (s2==0);

    ss2  = ((kss2==0)  || pc_ss2) && (s3==0);
    xj2  = ((kxj2==0)  || pc_xj2) && (s3==0);

    ss3  = ((kss3==0)  || pc_ss3) && (s4==0);
    xj3  = ((kxj3==0)  || pc_xj3) && (s4==0);

    szzx = ((kszzx==0) || pc_szzx) && (s5==0);
    szyx = ((kszyx==0) || pc_szyx) && (s5==0);

    zj   = ((kzj==0)   || pc_zj) && (s6==1);
    fs   = ((kfs==0)   || pc_fs) && (s7==1);
}
//--------------------------------------------------
// Programa principal
//--------------------------------------------------
void main(void)
{
    IO_init();

    PWM_init();

    UART2_Init();

    UART2_Text("BRAZO LISTO\r\n");

    while(1)
{
    PC_Control();
    if(kstop == 0)
    {
        pc_zx=0;
        pc_yx=0;
        pc_ss1=0;
        pc_xj1=0;
        pc_ss2=0;
        pc_xj2=0;
        pc_ss3=0;
        pc_xj3=0;
        pc_szzx=0;
        pc_szyx=0;
        pc_zj=0;
        pc_fs=0;

        PORTE=0;
        PORTF=0;
    }
    
    if(kaut == 0)
    {
        Manual_Control();
    }
}
}
